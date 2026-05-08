export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // feat(auth): add jwt login system
        'fix', // fix(auth): resolve login authentication issue
        'docs', // docs(readme): update installation guide
        'style', // style(ui): fix button alignment and spacing
        'refactor', // refactor(user): optimize query for user listing
        'test', // test(auth): add unit tests for login service
        'chore', // chore(deps): update npm dependencies
        'perf', // perf(cache): improve response time using redis
        'ci', // ci(github): add workflow for automated testing
        'revert', // revert a previous commit
        'build', // build(changes that affect the build system or external dependencies)
        'wip', // wip(auth): work in progress on authentication module
        'release', // release(v1.0.0)  commit
        'hotfix', // critical bug fix for production , hotfix(payment): fix critical payment gateway issue
        'config', // config(app): update environment configuration
        'security', // security(auth): fix token vulnerability issue
        'db', // db(migration): add users table schema
        'api' // api(user): add new user endpoint
      ]
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case']
  }
}
