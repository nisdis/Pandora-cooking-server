#!/usr/bin/env node
const fs = require('fs');
var infoInp = '{}';
try {
  infoInp = fs.readFileSync(process.argv[2] + '.ogg.info', 'utf8');
} catch (ex) {}
var userInp = '';
try {
  userInp = fs.readFileSync(process.argv[2] + '.ogg.users', 'utf8');
} catch (ex) {}
var info = JSON.parse(infoInp);
var users = {};
try {
  users = JSON.parse('{' + userInp + '}');
} catch (ex) {}
delete users[0];
for (var k in users) delete users[k].avatar;
info.tracks = users;
delete info.key;
delete info['delete'];
delete info.features;
function getUsername(d, id) {
  const username = d.discriminator === 0 ? d.username : `${d.username}#${d.discriminator}`;
  return (d.globalName ? `${d.globalName} (${username})` : username) + ` (${d.id || id})`;
}
if (process.argv[3] === 'text') {
  process.stdout.write(
    'Recording ' +
      process.argv[2] +
      '\r\n' +
      '\r\n' +
      'Guild:\t\t' +
      (info.guildExtra ? `${info.guildExtra.name} (${info.guildExtra.id})` : info.guild) +
      '\r\n' +
      'Channel:\t' +
      (info.channelExtra ? `${info.channelExtra.name} (${info.channelExtra.id})` : info.channel) +
      '\r\n' +
      'Requester:\t' +
      getUsername(info.requesterExtra, info.requesterId) +
      '\r\n' +
      'Start time:\t' +
      info.startTime +
      '\r\n' +
      '\r\n' +
      'Tracks:\r\n'
  );
  for (var ui = 1; users[ui]; ui++) process.stdout.write('\t' + getUsername(users[ui]) + '\r\n');
} else {
  process.stdout.write(JSON.stringify(info) + '\n');
}
