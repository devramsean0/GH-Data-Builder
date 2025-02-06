CREATE TABLE `fetches_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`formattedParams` text NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_repositories_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`github_id` integer NOT NULL,
	`name` text NOT NULL,
	`full_name` text NOT NULL,
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
	`archived` integer NOT NULL,
	`disabled` integer NOT NULL,
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
INSERT INTO `__new_repositories_table`("id", "user_id", "github_id", "name", "full_name", "description", "fork", "homepage", "language", "fork_count", "stargazers_count", "size", "default_branch", "open_issue_count", "is_test", "topics", "has_issues", "has_projects", "has_wiki", "has_pages", "has_downloads", "has_discussions", "archived", "disabled", "visibility", "pushed_at", "github_created_at", "github_updated_at", "permissions", "role_name", "delete_branch_on_merge", "subscribers_count", "network_count", "code_of_conduct", "license", "forks_count", "open_issues", "watchers_count", "allow_forking", "web_commit_signoff_required", "security_and_analysis") SELECT "id", "user_id", "github_id", "name", "full_name", "description", "fork", "homepage", "language", "fork_count", "stargazers_count", "size", "default_branch", "open_issue_count", "is_test", "topics", "has_issues", "has_projects", "has_wiki", "has_pages", "has_downloads", "has_discussions", "archived", "disabled", "visibility", "pushed_at", "github_created_at", "github_updated_at", "permissions", "role_name", "delete_branch_on_merge", "subscribers_count", "network_count", "code_of_conduct", "license", "forks_count", "open_issues", "watchers_count", "allow_forking", "web_commit_signoff_required", "security_and_analysis" FROM `repositories_table`;--> statement-breakpoint
DROP TABLE `repositories_table`;--> statement-breakpoint
ALTER TABLE `__new_repositories_table` RENAME TO `repositories_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `repositories_table_github_id_unique` ON `repositories_table` (`github_id`);