const express = require('express');
const client = require('./bot'); // your Discord bot
const { EmbedBuilder } = require('discord.js');
const app = express();

app.use(express.static('public'));
app.use(express.json());

app.post('/send-message', async (req, res) => {
  const channelId = '829323584227770392'; // change this!
  const { val1, val2, val3 } = req.body;

  try {
    const channel = await client.channels.fetch(channelId);

    const embed = new EmbedBuilder()
    .setTitle('Stock')
    .setColor(0x764ba2)  // Purple-ish color
    .addFields(
      { name: 'Cacao', value: val1, inline: true },
      { name: 'Beanstalk', value: val2, inline: true },
      { name: 'Pepper', value: val3, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'Alert Bot', iconURL: 'https://content.presentermedia.com/files/clipart/00033000/33245/red_alert_light_800_wht.jpg' });

  await channel.send({ embeds: [embed] });

    res.status(200).json({ success: true, message: 'Message sent!' });
  } catch (err) {
    console.error('Failed to send message:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ⬇️ MAKE SURE THIS IS HERE
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web server running on http://localhost:${PORT}`);
});