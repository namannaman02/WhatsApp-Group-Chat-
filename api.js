const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const Message = require('./models/message');
const Group = require('./models/group');

const app = express();

mongoose.connect('mongodb://localhost/whatsapp', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

app.get('/messages/:groupId', (req, res) => {
  const groupId = req.params.groupId;
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;

  Message.find({ group: groupId })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('sender')
    .exec((err, messages) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error loading messages' });
      }
      res.status(200).json({ success: true, messages });
    });
});

app.post('/messages/:groupId', (req, res) => {
  const groupId = req.params.groupId;
  const senderId = req.body.senderId;
  const text = req.body.text;

  Group.findById(groupId, (err, group) => {
    if (err) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    const message = new Message({
      group: groupId,
      sender: senderId,
      text
    });
    message.save((err, message) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error creating message' });
      }
      res.status(201).json({ success: true, message });
    });
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
