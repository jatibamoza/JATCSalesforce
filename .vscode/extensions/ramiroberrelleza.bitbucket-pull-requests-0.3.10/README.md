# Bitbucket Pull Requests

This extension adds a command that lets you start a pull request from the current branch into your repository's default branch. 

## Usage
Use the command palette (⇧⌘P) to start a pull request by selecting the "Bitbucket: Create pull request from current branch" command.

![create a pr from vscode](https://bitbucket.org/rberrelleza/bitbucket-pull-requests/raw/master/assets/command.png)


### Bitbucket server
Use the command palette (⇧⌘P) to configure your Bitbucket server a pull request by selecting the "Bitbucket: Set the Bitbucket Server URL" command.

![set the URL](https://bitbucket.org/rberrelleza/bitbucket-pull-requests/raw/master/assets/serverURLcommand.png)


You can also update your workspace settings directly via the configuration UI:

![set the URL via the settings](https://bitbucket.org/rberrelleza/bitbucket-pull-requests/raw/master/assets/settings.png)

## Requirements
You must have `git` installed and it has to be on the `$PATH`

Your default browser must be able to reach `https://bitbucket.org` or your bitbucket server instance.

## Known Issues

If a browser is not available, the extension won't be able to start the pull request.

Please report any issues [here](https://bitbucket.org/rberrelleza/bitbucket-pull-requests/issues).

## Release Notes

### 0.3.10
Fix escaping issue in Windows

### 0.3.9
Remove `scm/` from Bitbucket Server URLs

### 0.3.5
Correctly URL escape the branch name.

### 0.3.4
Fix #5, calculate the right source branch when the branch has slashes in the name.

### 0.3.3
Fix #4, use `start` instead of `explorer` to launch the browser on windows machines.

### 0.3.1
Support for windows and linux

### 0.3.0
Support for Bitbucket server

### 0.2.1
Autodetect the repo based on the open file

### 0.2.0
Fix error message when there's no branch

### 0.1.1
Fix publishing metadata

### 0.1.0
Initial release with support for Bitbucket.