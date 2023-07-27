export type Block =
		| {
				x: number;
				y: number;
				z: number;
				type: 'block' | 'bomb';
				isFlagged: boolean;
				isSweeped: boolean;
				facing: 'up' | 'down' | 'left' | 'right' | 'front' | 'back';
		  }
		| {
				x: number;
				y: number;
				z: number;
				type: 'air';
		  };

export type Cube = Block[][][];