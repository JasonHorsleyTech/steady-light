// Farmer — the first NPC the player meets.
// Acts as benefactor: offers barn lodging, farm chores, slime clearing.
// His advice is correct for slimes, useless for everything else.

VAR farmer_met = false
VAR drink_count = 0

-> start

=== start ===
{farmer_met:
    -> return_greeting
- else:
    -> first_meeting
}

=== first_meeting ===
# speaker: Farmer
# mood: friendly
Hey there, stranger. You look like you could use a place to sleep.
~ farmer_met = true
+ [That'd be great.] -> offer_barn
+ [What's the catch?] -> explain_deal

=== return_greeting ===
# speaker: Farmer
# mood: neutral
Morning. Fields are out back if you're ready to work.
+ [I'll get to it.] -> work_ready
+ [Any other jobs?] -> side_work

=== offer_barn ===
# speaker: Farmer
# mood: warm
Barn's out back. Not fancy, but it's dry. All I ask is you help with chores and keep the slimes off my field.
+ [Sounds fair.] -> deal_accepted
+ [How much does it cost?] -> explain_rent

=== explain_deal ===
# speaker: Farmer
# mood: practical
No catch. I need help. You need a roof.
Barn's yours if you pull your weight. Chores in the morning, slimes when they show up.
+ [Deal.] -> deal_accepted
+ [What about rent?] -> explain_rent

=== explain_rent ===
# speaker: Farmer
# mood: matter_of_fact
# sfx: coin-clink
3 silver a day for the barn. Chores pay 1 silver. Slimes are 1 silver each.
Most days you'll clear two or three of 'em. Math works out.
+ [I'll take it.] -> deal_accepted
+ [That's tight.] -> acknowledge_tight

=== acknowledge_tight ===
# speaker: Farmer
# mood: shrug
It's honest work. Bar in town sells drinks if you need to unwind after a long day. Just 1 silver.
+ [Alright, I'm in.] -> deal_accepted

=== deal_accepted ===
# speaker: Farmer
# mood: satisfied
Good. Grab a stick from the barrel by the door. That'll handle the slimes just fine.
-> END

=== work_ready ===
# speaker: Farmer
# mood: approving
Good attitude. Should be a few out there already.
-> END

=== side_work ===
# speaker: Farmer
# mood: thoughtful
Sometimes the neighbors need a hand. Check the board in town square — jobs pop up now and then.
+ [Thanks.] -> END
+ [What pays best?] -> best_pay

=== best_pay ===
# speaker: Farmer
# mood: honest
Slimes, if you're quick about it. Three slimes is a drink and change.
-> END
