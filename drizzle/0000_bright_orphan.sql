CREATE TABLE `game` (
	`game_id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `history` (
	`history_id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`piece_id` text NOT NULL,
	`from` text,
	`to` text NOT NULL,
	`type` text NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `game`(`game_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`piece_id`) REFERENCES `piece`(`piece_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `piece` (
	`piece_id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`player_id` text NOT NULL,
	`type` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`game_id`) REFERENCES `game`(`game_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`player_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `player` (
	`player_id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `history_game_idx` ON `history` (`game_id`);--> statement-breakpoint
CREATE INDEX `history_piece_idx` ON `history` (`piece_id`);--> statement-breakpoint
CREATE INDEX `piece_game_idx` ON `piece` (`game_id`);--> statement-breakpoint
CREATE INDEX `piece_player_idx` ON `piece` (`player_id`);