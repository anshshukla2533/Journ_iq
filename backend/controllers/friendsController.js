import { prisma } from '../lib/prisma.js';
import { hasUserUsernameField } from '../lib/prismaCapabilities.js';

const normalizeEmail = (e) => String(e || '').trim().toLowerCase();

export async function searchUsers(req, res) {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ users: [] });

    const currentUserId = req.user?.id || null;
    const orFilters = [
      { email: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } },
    ];

    if (hasUserUsernameField()) {
      orFilters.push({ username: { contains: q, mode: 'insensitive' } });
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { OR: orFilters },
          ...(currentUserId ? [{ id: { not: currentUserId } }] : []),
        ],
      },
      select: { id: true, name: true, email: true, online: true, lastLogin: true, ...(hasUserUsernameField() ? { username: true } : {}) },
      take: 20
    });
    const mapped = users.map(u => ({ ...u, _id: u.id }));
    res.json({ users: mapped });
  } catch (e) {
    console.error('Friend search failed:', e);
    res.status(500).json({ message: 'Search failed' });
  }
}

export async function sendRequest(req, res) {
  try {
    const senderEmail = normalizeEmail(req.user.email);
    const receiverEmail = normalizeEmail(req.body.receiverEmail);
    if (!receiverEmail) return res.status(400).json({ message: 'receiverEmail required' });
    if (senderEmail === receiverEmail) return res.status(400).json({ message: 'Cannot add yourself' });

    const receiver = await prisma.user.findUnique({ where: { email: receiverEmail } });
    if (!receiver) return res.status(404).json({ message: 'User not found' });
    
    const senderId = req.user.id;
    const receiverId = receiver.id;

    const existing = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') return res.status(200).json({ message: 'Already friends' });
      return res.status(200).json({ message: 'Request already exists' });
    }

    await prisma.friendRequest.create({
      data: { senderId, receiverId, status: 'PENDING' }
    });
    res.status(201).json({ message: 'Request sent' });
  } catch (e) {
    console.error('Failed to send friend request:', e);
    res.status(500).json({ message: 'Failed to send request' });
  }
}

export async function listRequests(req, res) {
  try {
    const incoming = await prisma.friendRequest.findMany({
      where: { receiverId: req.user.id, status: 'PENDING' },
      include: {
        sender: { select: { email: true, name: true, id: true } }
      }
    });
    const mapped = incoming.map(r => ({ ...r, _id: r.id, senderEmail: r.sender.email }));
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ message: 'Failed to list requests' });
  }
}

export async function acceptRequest(req, res) {
  try {
    const { requestId } = req.body;
    const fr = await prisma.friendRequest.findUnique({ where: { id: requestId } });
    if (!fr || fr.status !== 'PENDING') return res.status(404).json({ message: 'Request not found' });
    if (fr.receiverId !== req.user.id) return res.status(403).json({ message: 'Not allowed' });

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' }
    });
    res.json({ message: 'Accepted' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to accept' });
  }
}

export async function declineRequest(req, res) {
  try {
    const { requestId } = req.body;
    const fr = await prisma.friendRequest.findUnique({ where: { id: requestId } });
    if (!fr || fr.status !== 'PENDING') return res.status(404).json({ message: 'Request not found' });
    if (fr.receiverId !== req.user.id) return res.status(403).json({ message: 'Not allowed' });

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' } 
    });
    res.json({ message: 'Declined' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to decline' });
  }
}

export async function listFriends(req, res) {
  try {
    const myId = req.user.id;
    const friendsReqs = await prisma.friendRequest.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ senderId: myId }, { receiverId: myId }]
      },
      include: {
        sender: { select: { id: true, name: true, email: true, online: true, lastLogin: true } },
        receiver: { select: { id: true, name: true, email: true, online: true, lastLogin: true } }
      }
    });
    
    const friends = friendsReqs
      .map(fr => {
        const isSender = fr.senderId === myId;
        const f = isSender ? fr.receiver : fr.sender;
        return { ...f, _id: f.id };
      })
      .filter(friend => friend.id !== myId);
    res.json(friends);
  } catch (e) {
    res.status(500).json({ message: 'Failed to list friends' });
  }
}

export async function friendProfileByEmail(req, res) {
  try {
    const email = normalizeEmail(req.params.email);
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true, name: true, email: true, online: true, lastLogin: true, createdAt: true, sharedNotes: true }
    });
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json({ ...user, _id: user.id });
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
}
