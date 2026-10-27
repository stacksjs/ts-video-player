import { YAML } from 'bun'
import { expect, it } from 'bun:test'
import { join } from 'node:path'

const workflow = YAML.parse(await Bun.file(join(import.meta.dir, '../../../.github/workflows/release.yml')).text()) as {
  on: { workflow_dispatch: { inputs: { tag: { required: boolean } } } }
  jobs: { release: { permissions: Record<string, string>, steps: Array<{ name?: string, run?: string, with?: Record<string, unknown> }> } }
}

it('allows OIDC publishing and retries only an explicitly selected existing tag', () => {
  const job = workflow.jobs.release
  expect(job.permissions).toEqual({ contents: 'write', 'id-token': 'write' })
  expect(workflow.on.workflow_dispatch.inputs.tag.required).toBe(true)
  expect(job.steps.find(step => step.with?.['fetch-depth'] === 0)?.with?.ref).toBe('refs/tags/${{ inputs.tag || github.ref_name }}')
  expect(job.steps[0].name).toBe('Validate release tag')
})

it.each(['main', 'refs/tags/v0.1.11', 'v0.1.11; echo unsafe', '$(echo unsafe)', 'v0.1.11'])('validates release input without evaluating %s', async (tag) => {
  const run = workflow.jobs.release.steps[0].run!
  const proc = Bun.spawn(['bash', '-e', '-c', run], { env: { ...process.env, RELEASE_TAG: tag }, stdout: 'pipe', stderr: 'pipe' })
  expect(await proc.exited).toBe(tag === 'v0.1.11' ? 0 : 1)
})
