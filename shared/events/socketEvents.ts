export const SOCKET_EVENTS = {
  // Connection
  PLAYER_RECONNECT: "player:reconnect",
  PLAYER_RECONNECTED: "player:reconnected",

  // Room
  ROOM_CREATE: "room:create",
  ROOM_JOIN: "room:join",
  ROOM_LEAVE: "room:leave",
  ROOM_READY: "room:ready",
  ROOM_START: "room:start",
  ROOM_KICK: "room:kick",
  ROOM_ADD_BOT: "room:add-bot",
  ROOM_SETTINGS: "room:settings",
  ROOM_REMATCH: "room:rematch",
  ROOM_PLAYER_JOINED: "room:player-joined",
  ROOM_PLAYER_LEFT: "room:player-left",
  ROOM_STATE: "room:state",
  ROOM_ERROR: "room:error",
  LOBBY_ROOMS_UPDATE: "lobby:rooms-update",

  // Game
  GAME_START: "game:start",
  GAME_ACTION: "game:action",
  GAME_STATE: "game:state",
  GAME_TIMER: "game:timer",
  GAME_ROUND_START: "game:round-start",
  GAME_ROUND_END: "game:round-end",
  GAME_SCORE_UPDATE: "game:score-update",
  GAME_FINISHED: "game:finished",

  // Social
  CHAT_MESSAGE: "chat:message",
  CHAT_NEW_MESSAGE: "chat:new-message",
  REACTION_SEND: "reaction:send",
  REACTION_RECEIVED: "reaction:received",
} as const;
