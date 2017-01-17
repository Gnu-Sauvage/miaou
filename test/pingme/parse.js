var	buster = require("buster"),
	now = new Date("2017-05-07T22:30"), // assumed as UTC because in ISO format
	parse = require('../../plugins/pingme/plugin.js').parse;

function check(str, tzoffset, utcDate, text){
	var c = parse(str, tzoffset, now);
	buster.assert.equals(new Date(c.date*1000), new Date(utcDate));
	buster.assert.equals(c.text, text||"");
}

buster.testCase("pingme/parse", {

	"invalid": function(){
		["", "bla bla bla", "52h32 test"].forEach(str=>{
		    buster.assert.exception(function(){
			    parse(str, 0);
		    });
		});
	},

	"hour without day": function(){
		check("23h", 0, "2017-05-07T23:00");
		check("23h", -60, "2017-05-08T22:00");
		check("meeting at 23h at the pub", -60, "2017-05-08T22:00", "meeting at the pub");
		check("23h driiiinnng! wake up!", +60, "2017-05-08T00:00", "driiiinnng! wake up!");
		check("21h15 !", -60, "2017-05-08T20:15", "!");
		check("2h15", -60, "2017-05-08T01:15");
	},

	"tomorrow": function(){
		check("tomorrow 23h, Irish Coffee", -60, "2017-05-08T22:00", "Irish Coffee");
		check("tomorrow 2h", -60, "2017-05-08T01:00");
		check("tomorrow 0h minuit!", -60, "2017-05-07T23:00", "minuit!");
	},

	"complete date": function(){
		check("2045/12/01 23h", -60, "2045-12-01T22:00");
		check("24/11/2018 4h30", -60, "2018-11-24T03:30");
		check("1/24/2018 4h30", -60, "2018-01-24T03:30");
		check("6/24 4h30", -60, "2017-06-24T03:30");
		check("24/06 4h30", -60, "2017-06-24T03:30");
	},

	"duration": function(){
		check("in 3 hours and 5 minutes", -60, "2017-05-08T01:35");
		check("in 2 days, 1 hour read that book", 0, "2017-05-09T23:30", "read that book");
	}

});

