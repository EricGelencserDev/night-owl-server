#!/usr/bin/env node
const uniqid = require('uniqid');

function prompt(msg, def) {
    return new Promise((resolve, reject) => {
        let defStr = def ? ` [${def}]` : ``;
        process.stdout.write(`${msg}: ${defStr} `);
        process.stdin.on('data', (data => {
            let resp = data.toString().replace('\n', '');
            if (resp === '') resp = def || '';
            process.stdin.removeAllListeners();
            resolve(resp);
        }))
    })
}

async function start() {
    let users = [];
    let done = false;
    while (!done) {
        let user = {}
        user.name = await prompt('Name', `test_user${uniqid()}`);
        user.email = await prompt('Email', `${user.name}@test.com`);
        user.role = await prompt('Role (admin or user)', 'admin');
        user.password = await prompt('Password', 'testpw');
        users.push(user);
        console.log();
        done = (await prompt('Create more users?', 'y') === 'y') ? false : true
        console.log();
    }
    const { Users } = require('../models');
    console.log("Creating users...");
    let result = await Users.create(users);
    console.log(JSON.stringify(result, null, 2));
}

start().then(process.exit).catch(err => {
    console.error(err);
    process.exit(1);
});

async function testGigs() {
    let gigs = [];
    let done = false;
    while (!done) {
        let gig = {}
        gig.eventName = await prompt('Name');
        gig.venue = await prompt('Venue');
        gig.venueAddress = await prompt('Venue Address');
        gig.band = await prompt('Band', 'NightOwl');
        gigs.push(gig);
        console.log();
        done = (await prompt('Create more gigs?', 'y') === 'y') ? false : true
        console.log();
    }
    const { Gigs } = require('../models');
    console.log("Creating gigs...");
    let result = await Gigs.create(gigs);
    console.log(JSON.stringify(result, null, 2));
}

testGigs().then(process.exit).catch(err => {
    console.error(err);
    process.exit(1);
});