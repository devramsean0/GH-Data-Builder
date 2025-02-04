CREATE TABLE `repositories_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`github_id` integer NOT NULL,
	`name` text NOT NULL,
	`full_name` text NOT NULL,
	`private` integer NOT NULL,
	`description` text,
	`fork` integer NOT NULL,
	`homepage` text NOT NULL,
	`language` text NOT NULL,
	`fork_count` integer NOT NULL,
	`stargazers_count` integer NOT NULL,
	`size` integer NOT NULL,
	`default_branch` text NOT NULL,
	`open_issue_count` integer NOT NULL,
	`is_test` integer NOT NULL,
	`topics` text NOT NULL,
	`has_issues` integer NOT NULL,
	`has_projects` integer NOT NULL,
	`has_wiki` integer NOT NULL,
	`has_pages` integer NOT NULL,
	`has_downloads` integer NOT NULL,
	`has_discussions` integer NOT NULL,
	`archived` text NOT NULL,
	`disabled` text NOT NULL,
	`visibility` text NOT NULL,
	`pushed_at` text,
	`github_created_at` text NOT NULL,
	`github_updated_at` text NOT NULL,
	`permissions` blob NOT NULL,
	`role_name` text NOT NULL,
	`delete_branch_on_merge` integer NOT NULL,
	`subscribers_count` integer NOT NULL,
	`network_count` integer NOT NULL,
	`code_of_conduct` blob NOT NULL,
	`license` blob,
	`forks_count` integer NOT NULL,
	`open_issues` integer NOT NULL,
	`watchers_count` integer NOT NULL,
	`allow_forking` integer NOT NULL,
	`web_commit_signoff_required` integer NOT NULL,
	`security_and_analysis` blob
);
--> statement-breakpoint
CREATE UNIQUE INDEX `repositories_table_github_id_unique` ON `repositories_table` (`github_id`);--> statement-breakpoint
ALTER TABLE `users_table` ADD `plan` blob NOT NULL;--> statement-breakpoint
ALTER TABLE `users_table` DROP COLUMN `title`;--> statement-breakpoint
ALTER TABLE `users_table` DROP COLUMN `description`;--> statement-breakpoint
ALTER TABLE `users_table` DROP COLUMN `plan_name`;--> statement-breakpoint
ALTER TABLE `users_table` DROP COLUMN `plan_ldap_dn`;--> statement-breakpoint
ALTER TABLE `users_table` DROP COLUMN `plan_business_plus`;