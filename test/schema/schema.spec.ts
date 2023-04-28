import { describe, expect, test } from 'vitest'

import { Schema } from '@/schema'

const testSchema = `
definition user {}

definition project {
	relation issue_creator: role#member
	relation issue_assigner: role#member
	relation any_issue_resolver: role#member
	relation assigned_issue_resolver: role#member
	relation comment_creator: role#member
	relation comment_deleter: role#member
	relation role_manager: role#member

	permission create_issue = issue_creator
	permission create_role = role_manager
}

definition role {
	relation project: project
	relation member: user
	relation built_in_role: project

	permission delete = project->role_manager - built_in_role->role_manager
	permission add_user = project->role_manager
	permission add_permission = project->role_manager - built_in_role->role_manager
	permission remove_permission = project->role_manager - built_in_role->role_manager
}

definition issue {
	relation project: project
	relation assigned: user

	permission assign = project->issue_assigner
	permission resolve = (project->assigned_issue_resolver & assigned) + project->any_issue_resolver
	permission create_comment = project->comment_creator

	// synthetic relation
	permission project_comment_deleter = project->comment_deleter
}

definition comment {
	relation issue: issue
	permission delete = issue->project_comment_deleter
}

`

describe('Schema', () => {
  test('getRelationsForDefinition', () => {
    const schema = Schema.fromString(testSchema)
    const userRelations = schema.getRelationsForDefinition('user')
    expect(userRelations.length).toBe(2)
    expect(userRelations[0].name).toEqual('member')
    expect(userRelations[1].name).toEqual('assigned')

    const projectRelations = schema.getRelationsForDefinition('project')
    expect(projectRelations.length).toBe(3)
    expect(projectRelations[0].name).toEqual('project')
    expect(projectRelations[1].name).toEqual('built_in_role')
    expect(projectRelations[2].name).toEqual('project')

    const roleRelations = schema.getRelationsForDefinition('role')
    expect(roleRelations.length).toBe(7)

    const issueRelations = schema.getRelationsForDefinition('issue')
    expect(issueRelations.length).toBe(1)
    expect(issueRelations[0].name).toEqual('issue')

    const commentRelations = schema.getRelationsForDefinition('comment')
    expect(commentRelations.length).toBe(0)
  })
})
