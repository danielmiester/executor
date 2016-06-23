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

## Installation
Clone this project to somewhere on your system path, or add the executable to your path.


## Usage
Command Usage:
    
    executor.js [--instance instance] [--user user] --file file| file

    --instance, -i instance     instance fqdn to access (default:datacenterdev.service-now.com)
    --user, -u user             username to access instance as (default: current username)
    --file, -f file             (required) JS file to execute as the contents of instance's Background Scripts page

## Example

executor