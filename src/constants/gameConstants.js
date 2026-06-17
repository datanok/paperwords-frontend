export const GAME_STATES = {
  WAITING_FOR_GUEST: 'waiting_for_guest',
  READY_FOR_WORDS: 'ready_for_words',
  PLAYING: 'playing',
  FINISHED: 'finished',
};

export const PLAYER_ROLES = {
  HOST: 'host',
  GUEST: 'guest',
};

export const WORD_LENGTH = {
  MIN: 4,
  MAX: 8,
};

export const TIMEOUTS = {
  HEARTBEAT_INTERVAL: 5000,
  DISCONNECT_GRACE_PERIOD: 60000, // 60 seconds
};

export const SOCKET_EVENTS = {
  // Connection
  CONNECTION_ESTABLISHED: 'connection_established',
  HEARTBEAT_PING: 'heartbeat:ping',
  HEARTBEAT_PONG: 'heartbeat:pong',

  // Room
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_SET_WORD_LENGTH: 'room:setWordLength',
  ROOM_PLAYER_JOINED: 'room:playerJoined',
  ROOM_PLAYER_DISCONNECTED: 'room:playerDisconnected',
  ROOM_PLAYER_LEFT: 'room:playerLeft',
  ROOM_CLOSING: 'room:closing',
  GAME_WORD_LENGTH_SET: 'game:wordLengthSet',

  // Game (Phase 3)
  GAME_SUBMIT_WORD: 'game:submitWord',
  GAME_GUESS_WORD: 'game:guessWord',
  GAME_READY: 'game:ready',
  GAME_BOTH_READY: 'game:bothReady',
  GAME_COUNTDOWN_TICK: 'game:countdownTick',
  GAME_STARTED: 'game:gameStarted',
  GAME_FEEDBACK: 'game:feedback',
  GAME_TURN_CHANGED: 'game:turnChanged',
  GAME_WON: 'game:won',

  // Stickers
  GAME_SEND_STICKER: 'game:sendSticker',
  GAME_STICKER_RECEIVED: 'game:stickerReceived',
};

export const SESSION_KEYS = {
  USER_ID: 'paperwords_user_id',
  SESSION_ID: 'paperwords_session_id',
  ROOM_ID: 'paperwords_room_id',
  PLAYER_ROLE: 'paperwords_player_role',
  WORD_LENGTH: 'paperwords_word_length',
};
