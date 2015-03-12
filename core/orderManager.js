/*

	Order Manager 

*/

/*

Once an order is placed:

1. Are we the highest buyer?
	a. are we sole highest buyer? (no one is at the same price before us)
2. Is the spread still profitable?
3. Was a wall just put in?

If not the highest buyer anymore:
1. is the spread still past the threshold?

Keep checking other spreads, if another arises that is better
1. cancel current trade
2. initiate anaylsis on new market