import User from '../models/User.js';
import Friendship from '../models/Friendship.js';

const normalizeEmail = (e) => String(e || '').trim().toLowerCase();

export async function searchUsers(req, res) {
  try {
    const q = String(req.query.q || req.query.query || '').trim();
    if (!q) return res.json({ users: [] });
    const emailQuery = q.includes('@') ? normalizeEmail(q) : null;
    const or = emailQuery
      ? [{ email: emailQuery }]
      : [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ];
    const users = await User.find({ $or: or }).select('_id name email online');
    res.json({ users });
  } catch (e) {
    res.status(500).json({ message: 'Search failed' });
  }
}

export async function listFriends(req, res) {
  try {
    const myId = req.user._id;
    const friendships = await Friendship.find({
      $or: [{ requester: myId, status: 'accepted' }, { recipient: myId, status: 'accepted' }]
    }).populate('requester recipient', 'name email online');

    const friends = friendships.map(f => {
      const friend = f.requester._id.toString() === myId.toString() ? f.recipient : f.requester;
      return { _id: friend._id, name: friend.name, email: friend.email, online: friend.online, conversationId: f.conversationId };
    });
    res.json(friends);
  } catch (e) {
    res.status(500).json({ message: 'Failed to list friends' });
  }
}

export async function listRequests(req, res) {
  try {
    const myId = req.user._id;
    const incoming = await Friendship.find({ recipient: myId, status: 'pending' }).populate('requester', 'name email');
    res.json(incoming.map(r => ({ _id: r._id, requesterId: r.requester._id, requesterName: r.requester.name, requesterEmail: r.requester.email, createdAt: r.createdAt })));
  } catch (e) {
    res.status(500).json({ message: 'Failed to list requests' });
  }
}

export async function sendRequest(req, res) {
  try {
    const myId = req.user._id;
    const { receiverId } = req.body;
    if (!receiverId) return res.status(400).json({ message: 'receiverId required' });
    if (String(receiverId) === String(myId)) return res.status(400).json({ message: 'Cannot add yourself' });

    // Ensure user exists
    const other = await User.findById(receiverId).select('_id email');
    if (!other) return res.status(404).json({ message: 'User not found' });

    // Upsert a pending friendship (prevent duplicates)
    const doc = await Friendship.findOneAndUpdate(
      { $or: [{ requester: myId, recipient: receiverId }, { requester: receiverId, recipient: myId }] },
      { $setOnInsert: { requester: myId, recipient: receiverId, status: 'pending' } },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Request sent', request: { _id: doc._id } });
  } catch (e) {
    res.status(500).json({ message: 'Failed to send request', error: e.message });
  }
}

export async function acceptRequest(req, res) {
  try {
    const myId = req.user._id;
    const { requestId } = req.body;
    const reqDoc = await Friendship.findById(requestId);
    if (!reqDoc || String(reqDoc.recipient) !== String(myId)) return res.status(404).json({ message: 'Request not found or not allowed' });
    reqDoc.status = 'accepted';
    // compute conversationId from emails for messaging
    const me = await User.findById(myId).select('email');
    const other = await User.findById(reqDoc.requester).select('email');
    if (me && other) reqDoc.conversationId = [String(me.email).toLowerCase(), String(other.email).toLowerCase()].sort().join(':');
    await reqDoc.save();
    res.json({ message: 'Accepted' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to accept', error: e.message });
  }
}

export async function declineRequest(req, res) {
  try {
    const myId = req.user._id;
    const { requestId } = req.body;
    const reqDoc = await Friendship.findById(requestId);
    if (!reqDoc || String(reqDoc.recipient) !== String(myId)) return res.status(404).json({ message: 'Request not found or not allowed' });
    reqDoc.status = 'declined';
    await reqDoc.save();
    res.json({ message: 'Declined' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to decline', error: e.message });
  }
}

export async function removeFriend(req, res) {
  try {
    const myId = req.user._id;
    const { friendId } = req.body;
    await Friendship.findOneAndDelete({ $or: [{ requester: myId, recipient: friendId }, { requester: friendId, recipient: myId }] });
    res.json({ message: 'Removed' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to remove friend', error: e.message });
  }
}

export default {
  searchUsers,
  listFriends,
  listRequests,
  sendRequest,
  acceptRequest,
  declineRequest,
  removeFriend
};
