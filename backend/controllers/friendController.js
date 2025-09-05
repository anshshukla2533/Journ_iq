
export async function getUserProfile(req, res) {
  try {
    const user = await User.findById(req.params.id)
      .select('name email friends sharedNotes createdAt online lastLogin')
      .populate('friends', 'name')
      .populate('sharedNotes', 'text');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      friends: user.friends,
      sharedNotes: user.sharedNotes,
      createdAt: user.createdAt,
      online: user.online,
      lastLogin: user.lastLogin
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
import User from '../models/User.js';
import Friend from '../models/Friend.js';
import Notification from '../models/Notification.js';


export async function searchUsers(req, res) {
  try {
    const { query } = req.query;
    if (!query || !query.trim()) {
      return res.json({ success: true, users: [] });
    }
    const users = await User.find({
      $and: [
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        },
        { _id: { $ne: req.user._id } }
      ]
    }).select('name email');
    res.json({ success: true, users });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function getPendingRequests(req, res) {
  try {
    const requests = await Friend.find({ recipient: req.user._id, status: 'pending' }).populate('requester', 'name email');
    res.json(requests.map(r => ({
      _id: r._id,
      requesterId: r.requester._id,
      requesterName: r.requester.name,
      requesterEmail: r.requester.email
    })));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export async function sendRequest(req, res) {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user._id;
    const friend = await Friend.create({ requester: requesterId, recipient: recipientId });
    await Notification.create({ user: recipientId, type: 'friend_request', message: `${req.user.name} sent you a friend request.` });
    res.status(201).json(friend);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export async function acceptRequest(req, res) {
  try {
    const { requestId } = req.body;
    const friend = await Friend.findByIdAndUpdate(requestId, { status: 'accepted' }, { new: true });
    await User.findByIdAndUpdate(friend.requester, { $push: { friends: friend.recipient } });
    await User.findByIdAndUpdate(friend.recipient, { $push: { friends: friend.requester } });
    res.json(friend);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export async function declineRequest(req, res) {
  try {
    const { requestId } = req.body;
    const friend = await Friend.findByIdAndUpdate(requestId, { status: 'declined' }, { new: true });
    res.json(friend);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export async function listFriends(req, res) {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name email online');
    res.json(user.friends);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export async function listOnlineFriends(req, res) {
  try {
    const user = await User.findById(req.user._id).populate({ path: 'friends', match: { online: true }, select: 'name email online' });
    res.json(user.friends);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
