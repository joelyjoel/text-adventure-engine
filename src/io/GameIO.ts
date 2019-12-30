import * as EventEmitter from 'events';

interface GameIOMessage {
  from: 'user' | 'game' | 'system';
  body: string;
  timestamp?: number;
}

export class GameIO extends EventEmitter {
  transcript: GameIOMessage[];

  /** Use this function to send user input into the interface. */
  input(str:string) {
    this.emit('userInput', str);

    let message:GameIOMessage = {
      from: 'user',
      body: str,
      timestamp: Date.now()
    }

    this.transcript.push(message);

    this.emit('msg', message);
  }

  /** Use this function to write a message from the game or the system to the io. */
  write(body:string, from:'game'|'system' = 'game') {
    let message = {
      body,
      from,
      timestamp: Date.now(),
    }

    this.transcript.push(message);

    this.emit('msg', message);
    if(from == 'game')
      this.emit('gameMsg', body);
    else if(from == 'system')
      this.emit('systemMsg', body);
  }

  clearTranscript() {
    this.transcript = [];
  }

  get plaintext() {
    return this.transcript.map(
      msg => (msg.from == 'user' ? ' > ' : '') + msg.body
    ).join('\n\n')
  }
}