require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');
const fs = require('node:fs');
const path = require('node:path');
const db = require('./firebase');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = 'UClpYaV73nQDaJf-Vx3CYqVA';
const DISCORD_CHANNEL_ID = '829323584227770392';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// To store last video ID and avoid duplicates
let lastVideoId = null;

async function checkLatestVideo() {
  // Get Uploads playlist ID for channel
  const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
  const channelData = await channelResponse.json();
  if (!channelData.items || channelData.items.length === 0) {
    console.error('Channel not found');
    return;
  }
  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

  // Get latest video from uploads playlist
  const playlistResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=1&key=${YOUTUBE_API_KEY}`);
  const playlistData = await playlistResponse.json();

  if (!playlistData.items || playlistData.items.length === 0) {
    console.log('No videos found');
    return;
  }

  const latestVideo = playlistData.items[0].snippet;
  const videoId = latestVideo.resourceId.videoId;

  if (videoId !== lastVideoId) {
    lastVideoId = videoId;
    const videoTitle = latestVideo.title;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);

    if (channel) {
      channel.send(`📢 New video uploaded: **${videoTitle}**\nWatch here: ${videoUrl}`);
      console.log(`Sent notification for video: ${videoTitle}`);
    } else {
      console.error('Discord channel not found');
    }
  } else {
    console.log('No new video yet');
  }
}

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
    // Check for new videos every 5 minutes (300,000 ms)
    checkLatestVideo();
    setInterval(checkLatestVideo, 300000);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const log = {
    messageId: message.id,
    content: message.content,
    authorId: message.author.id,
    authorTag: message.author.tag,
    channelId: message.channel.id,
    channelName: message.channel.name,
    guildId: message.guild.id,
    guildName: message.guild.name,
    timestamp: message.createdAt,
    edited: false
  };

  try {
    await db.collection('messages').doc(message.id).set(log);
    console.log('Message logged to Firestore.');
  } catch (err) {
    console.error('Error logging message:', err);
  }
});

client.login(process.env.BOT_TOKEN);

// Export the bot so other files can use it
module.exports = client;