var ChannelUtil = module.exports;

var GLOBAL_CHANNEL_NAME = 'gameGlobal';
var TEAM_CHANNEL_PREFIX = 'team_';

ChannelUtil.getGlobalChannelName = function() {
  return GLOBAL_CHANNEL_NAME;
};

ChannelUtil.getTeamChannelName = function(teamId) {
  return TEAM_CHANNEL_PREFIX + teamId;
};
