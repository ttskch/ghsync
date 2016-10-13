# ghsync

Sync local git repository and remote GitHub repository automatically.

## Requirement

This tool requires local git version [1.7.9.6](https://git-scm.com/docs/git-pull/1.7.9.6) or later for using `--no-edit` option for `git pull`. 

## Getting started

## Usage

### Email notification

You will get a notification email like below.

```
Subject: [ghsync] Error occurred in auto git-pull

[path]
/path/to/local/repo

[stdout]
Auto-merging 1
CONFLICT (content): Merge conflict in 1
Automatic merge failed; fix conflicts and then commit the result.

[stderr]
From github.com:owner/repo
 * branch            master     -> FETCH_HEAD
   1c35585..759c171  master     -> origin/master
```
