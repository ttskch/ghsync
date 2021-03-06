# ghsync

[![Travis](https://img.shields.io/travis/ttskch/ghsync.svg?style=flat-square)](https://travis-ci.org/ttskch/ghsync)
[![npm version](https://img.shields.io/npm/v/ghsync.svg?style=flat-square)](https://www.npmjs.com/package/ghsync)
[![npm downloads](https://img.shields.io/npm/dm/ghsync.svg?style=flat-square)](https://www.npmjs.com/package/ghsync)

This is a cli tool to sync local git repository and remote GitHub repository automatically.

For example, if your tech team and biz team share some codebase, tech team wants to manage it with git (and GitHub) but biz team wants to edit files directly via FTP, right?

You can resolve this problem with ghsync.

1. At first, initialize your codebase on the FTP server as a local git repository and push them to GitHub.
1. Let ghsync observe your local git repository and remote GitHub repository by starting ghsync server.
1. if your biz team edits files directly, ghsync automatically `git add`, `git commit` and `git push`.
1. if your tech team pushes some commits to GitHub, ghsync catches the webhook and automatically `git pull`.

Additionally, if some auto-push and auto-pull conflict, ghsync stops observing soon and sends you a notification email. So you don't have to worry about that ghsync destroys your codebase.

![](https://cloud.githubusercontent.com/assets/4360663/23062161/0f09720e-f548-11e6-855c-16d6cdf883a6.gif)

## Requirements

This tool requires local git version [1.7.9.6](https://git-scm.com/docs/git-pull/1.7.9.6) or later for using `--no-edit` option for `git pull`.

## Installation

```bash
$ npm install -g ghsync
```

## Configuration

At first run `ghsync init` to generate configuration file in `~/.config/ghsync/default.yml` with [initial content](config/default.yml.placeholder) and tailor this file.

```bash
$ ghsync init
$ vi ~/.config/ghsync/default.yml
```

### Required properties

* Remote GitHub repository's name
* Local git repository directory's path
* GitHub webhook secret

### Optional properties

* Some local sub directories' paths you want to ignore in observing
* Port number for catching GitHub webhook
* Commit interval (When many files are directly edited at one time, ghsync waits a moment to `git commit` so that prevents creating many commits uselessly)
* Email notification related settings

## Usage

At first, configure webhook on GitHub.

![image](https://cloud.githubusercontent.com/assets/4360663/19375726/20bc35c0-9212-11e6-9425-9009128fb1d3.png)

And start ghsync server on your server.

```bash
$ ghsync run
```

That's it.

When local git repository is directly edited ghsync commits it with message "Automatically committed". And When remote GitHub repository is updated ghsync pulls it soon.

### Email notification

If some auto-push and auto-pull conflict, ghsync stops observing soon and sends you a notification email like below.

```
Subject: [ghsync] Error occurred in auto git-pull

[path]
/path/to/local/repo

[stdout]
Updating 40a9764..dc47ada

[stderr]
From github.com:owner/repo
 * branch            master     -> FETCH_HEAD
   40a9764..dc47ada  master     -> origin/master
error: Your local changes to the following files would be overwritten by merge:
        some/changed/file
Please, commit your changes or stash them before you can merge.
Aborting
```

Then you should go to your server and resolve conflict by hand, and commit and push it.

After you push it, auto-pull runs because remote GitHub repository is updated just now by you, and this pulling will get successful. Then, ghsync starts observing again automatically.

### Daemonize

You may want to run ghsync on background. You can use [Supervisor](http://supervisord.org/) or something to do that. But especially for Node.js script it's one of the easiest way to use [forever](https://github.com/foreverjs/forever).

```bash
# install forever
$ npm install -g forever

# run ghsync via forever
$ forever start $(which ghsync) run

# confirm process is running
$ forever list
info:    Forever processes running
data:        uid  command             script                    forever pid   id logfile                      uptime
data:    [0] H7wO /usr/local/bin/node /usr/local/bin/ghsync run 59716   59726    /home/user/.forever/H7wO.log 0:0:0:2.636
```

You can stop daemon by like below.

```bash
$ forever stop 0
```

Please learn more at [forever GitHub repository](https://github.com/foreverjs/forever).
