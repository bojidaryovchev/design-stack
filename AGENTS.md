# design-stack

This repository **is** a Claude Code plugin. It is not an application and it is not a template
to copy into other projects.

If you are an agent working *on* this repo, read [CLAUDE.md](CLAUDE.md). It carries the layout
and the maintenance rules, and it is the single copy.

If you are looking for the design rulings themselves, they are in
`skills/design-arbiter/SKILL.md` with the evidence in
`skills/design-arbiter/reference/conflicts.md`. Do not restate them anywhere else.
One copy is the point; a second one drifts.

## Do not run a multi-provider install here

`npx impeccable install --providers=<other>` writes a full duplicate of the skill tree into a
per-provider directory and generates a context file pointing at it. That is the right thing to
do in a consuming project that uses a non-Claude agent. It is the wrong thing to do in this
repo: the copies go stale the moment `design-arbiter/` changes, and the generated context file
duplicates rulings that are supposed to live in exactly one place.

Those paths are gitignored so a stray install cannot be committed by accident.
