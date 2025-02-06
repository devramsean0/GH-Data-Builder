import { int ,sqliteTable, text, blob } from "drizzle-orm/sqlite-core";
import {relations} from "drizzle-orm";

export const usersTable = sqliteTable("users_table", {
    id: int().primaryKey({ autoIncrement: true }),
    login: text().notNull(),
    github_id: int().notNull().unique(),
    gravatar: int().notNull(),
    site_admin: int().notNull(),
    name: text(),
    company_name: text(),
    location: text(),
    hireable: int(),
    twitter_username: text(),
    public_repo_count: int().notNull(),
    public_gist_count: int().notNull(),
    followers_count: int().notNull(),
    following_count: int().notNull(),
    github_created_at: text().notNull(),
    github_updated_at: text().notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
    repositories: many(repositoriesTable),
}));

export const repositoriesTable = sqliteTable("repositories_table", {
    id: int().primaryKey({ autoIncrement: true }),
    user_id: int().notNull(),
    github_id: int().notNull().unique(),
    name: text().notNull(),
    full_name: text().notNull(),
    description: text(),
    fork: int().notNull(),
    homepage: text().notNull(),
    language: text().notNull(),
    fork_count: int().notNull(),
    stargazers_count: int().notNull(),
    size: int().notNull(),
    default_branch: text().notNull(),
    open_issue_count: int().notNull(),
    is_test: int().notNull(),
    topics: text().notNull(),
    has_issues: int().notNull(),
    has_projects: int().notNull(),
    has_wiki: int().notNull(),
    has_pages: int().notNull(),
    has_downloads: int().notNull(),
    has_discussions: int().notNull(),
    archived: int().notNull(),
    disabled: int().notNull(),
    visibility: text().notNull(),
    pushed_at: text(),
    github_created_at: text().notNull(),
    github_updated_at: text().notNull(),
    permissions: blob().notNull(),
    role_name: text().notNull(),
    delete_branch_on_merge: int().notNull(),
    subscribers_count: int().notNull(),
    network_count: int().notNull(),
    code_of_conduct: blob().notNull(),
    license: blob(),
    forks_count: int().notNull(),
    open_issues: int().notNull(),
    watchers_count: int().notNull(),
    allow_forking: int().notNull(),
    web_commit_signoff_required: int().notNull(),
    security_and_analysis: blob(),

})

export const repositoriesRelations = relations(repositoriesTable, ({ one }) => ({
    author: one(usersTable, {
        fields: [repositoriesTable.user_id],
        references: [usersTable.github_id],
    }),
}));

export const fetchesTable = sqliteTable("fetches_table", {
    id: int().primaryKey({ autoIncrement: true }),
    url: text().notNull(),
    formattedParams: text().notNull(),
})