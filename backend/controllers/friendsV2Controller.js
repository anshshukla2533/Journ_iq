import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';

const normalizeEmail = (e) => String(e || '').trim().toLowerCase();

export async function searchUsers(req, res) {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ users: [] });
    const emailQuery = q.includes('@') ? normalizeEmail(q) : null;
    const or = emailQuery
      ? [{ email: emailQuery }]
      : [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ];
    const users = await User.find({ $or: or })
      .select('_id name email online lastLogin')
      .limit(20);
    res.json({ users });
  } catch (e) {
    res.status(500).json({ message: 'Search failed' });
  }
}

export async function sendRequest(req, res) {
  try {
    const senderEmail = normalizeEmail(req.user.email);
    const receiverEmail = normalizeEmail(req.body.receiverEmail);
    if (!receiverEmail) return res.status(400).json({ message: 'receiverEmail required' });
    if (senderEmail === receiverEmail) return res.status(400).json({ message: 'Cannot add yourself' });

    // If already friends, short-circuit
    const sender = await User.findOne({ email: senderEmail }).select('_id friends');
    const receiver = await User.findOne({ email: receiverEmail }).select('_id friends');
    if (!receiver) return res.status(404).json({ message: 'User not found' });
    if (sender.friends?.some(id => String(id) === String(receiver._id))) {
      return res.status(200).json({ message: 'Already friends' });
    }

    const existing = await FriendRequest.findOne({ senderEmail, receiverEmail, status: 'pending' });
    if (existing) return res.status(200).json({ message: 'Request already sent' });

    await FriendRequest.create({ senderEmail, receiverEmail, status: 'pending' });
    res.status(201).json({ message: 'Request sent' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to send request' });
  }
}

export async function listRequests(req, res) {
  try {
    const email = normalizeEmail(req.user.email);
    const incoming = await FriendRequest.find({ receiverEmail: email, status: 'pending' });
    res.json(incoming);
  } catch (e) {
    res.status(500).json({ message: 'Failed to list requests' });
  }
}

export async function acceptRequest(req, res) {
  try {
    const { requestId } = req.body;
    const fr = await FriendRequest.findById(requestId);
    if (!fr || fr.status !== 'pending') return res.status(404).json({ message: 'Request not found' });
    const myEmail = normalizeEmail(req.user.email);
    if (normalizeEmail(fr.receiverEmail) !== myEmail) return res.status(403).json({ message: 'Not allowed' });

    const sender = await User.findOne({ email: normalizeEmail(fr.senderEmail) }).select('_id friends');
    const receiver = await User.findOne({ email: normalizeEmail(fr.receiverEmail) }).select('_id friends');
    if (!sender || !receiver) return res.status(404).json({ message: 'Users missing' });

    // Add each other as friends
    if (!sender.friends.some(id => String(id) === String(receiver._id))) sender.friends.push(receiver._id);
    if (!receiver.friends.some(id => String(id) === String(sender._id))) receiver.friends.push(sender._id);
    await sender.save();
    await receiver.save();

    fr.status = 'accepted';
    await fr.save();
    res.json({ message: 'Accepted' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to accept' });
  }
}

export async function declineRequest(req, res) {
  try {
    const { requestId } = req.body;
    const fr = await FriendRequest.findById(requestId);
    if (!fr || fr.status !== 'pending') return res.status(404).json({ message: 'Request not found' });
    fr.status = 'declined';
    await fr.save();
    res.json({ message: 'Declined' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to decline' });
  }
}

export async function listFriends(req, res) {
  try {
    const me = await User.findById(req.user._id).populate('friends', 'name email online lastLogin');
    res.json(me?.friends || []);
  } catch (e) {
    res.status(500).json({ message: 'Failed to list friends' });
  }
}

export async function friendProfileByEmail(req, res) {
  try {
    const email = normalizeEmail(req.params.email);
    const user = await User.findOne({ email }).select('_id name email online lastLogin friends sharedNotes createdAt');
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
}


