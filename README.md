## Servicenow instance executor
Executes a provided script in the 'Background scripts' page of a service now instance
This was written for my uses as an internal developer, so decisions were made mostly with 
consideration for what I need, and what my fellow devs need.
I am already aware of the snow-runner project already in existance, but I  was already 
mostly done with this at the time. I couldn't make it work well for what I needed so
I build this one.
This one emulates a user at a browser, so there should be no need for special
permissions. If you can access `/sys.scripts.do` as your login, this tool should work fine.



Addendum: if you are using an account escalation plugin, please login using a browser, 
and escalate your user before using this tool

## Prerequisites
Node.js ^6.2.2
I use arrow notation in this script, so your install of node must be able to support it.

## Installation
### Manually
1. Clone this project to somewhere on your system path, or add the executable to your path.
2. From within the directory, run `npm install` to retrieve and install all dependencies.
    - If you run `npm install -g` it will install all the packages globally, as well as
    installing a symlink '/usr/local/bin/executor' to your path.
3. Create a keychain item (MAX OS X: Keyring Access) named after the FQDN of the instance you
    want to access, with *Account* set to the desired login username, and the appropriate password
     (If you get it wrong, the program will let you know and instruct you of the appropriate values)
4. Have fun!

### Via npm
1. Run `npm install -g sn-script-executor` it will install all the packages globally, as well as
    installing a symlink '/usr/local/bin/executor' to your path.
2. Create a keychain item (MAX OS X: Keyring Access) named after the FQDN of the instance you
    want to access, with *Account* set to the desired login username, and the appropriate password
     (If you get it wrong, the program will let you know and instruct you of the appropriate values)
4. Have fun!

## Usage
Command Usage:
    
    executor.js [--instance instance] [--user user] --file file| file

    --instance, -i instance     instance fqdn to access (default:datacenterdev.service-now.com)
    --user, -u user             username to access instance as (default: current username)
    --file, -f file             (required) JS file to execute as the contents of instance's Background Scripts page

## Examples
    executor.js foo.js
Executes the contents of `foo.js` on the default instance as your local machine username

    executor.js -u daniel.dejager foo.js
Executes the contents of `foo.js` on the default instance as the user 'daniel.dejager'

    executor.js -u daniel.dejager -i myinstance.service-now.com foo.js
Executes the contents of `foo.js` on the default instance as the user 'daniel.dejager'

    executor.js -u daniel.dejager -i myinstance.service-now.com foo.js
Executes the contents of `foo.js` on the default instance as the user 'daniel.dejager'

