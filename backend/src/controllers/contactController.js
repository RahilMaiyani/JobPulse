const contactModel = require('../models/contactModel');

const sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { subject, message } = req.body;

    if (!subject || subject.trim().length < 5 || subject.trim().length > 255) {
      return res.status(400).json({ error: 'Subject must be between 5 and 255 characters long.' });
    }

    if (!message || message.trim().length < 10 || message.trim().length > 1000) {
      return res.status(400).json({ error: 'Message must be between 10 and 1000 characters long.' });
    }

    const newMessage = await contactModel.createMessage(userId, subject.trim(), message.trim());
    res.status(201).json({ message: 'Message sent successfully', data: newMessage });
  } catch (err) {
    next(err);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const messages = await contactModel.getAllMessages();
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

const archiveMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const archived = await contactModel.archiveMessage(id);
    if (!archived) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message: 'Message archived successfully' });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await contactModel.markAsRead(id);
    if (!updated) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message: 'Message marked as read', data: updated });
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await contactModel.getUnreadCount();
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendMessage,
  getMessages,
  archiveMessage,
  markAsRead,
  getUnreadCount
};
