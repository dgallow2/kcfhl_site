(function($) {

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

var teamsHTML = "<div class='teamList clearfix'><div class='col-xs-16 col-md-6'>";
styles = "";
$.each(arrayFromPHP, function(t, e) {
    if (0 == t) var a = "42.86%";
    else if (1 == t) var a = "28.57%";
    else if (2 == t) var a = "19.05%";
    else if (3 == t) var a = "9.5.2%";
	
	
	
	//account for trades
	if (e.traded !== 'no'){
		
		teamsHTML += "<h2 class='" + e.traded + " index_" + t + " notChosen'><span class='logo'></span><span class='text'></span><span class='textVia'></span><span class='cap capOne capTwo'>" + a + "</span></h2>";
		
		tradedSplit = e.traded.split(' ');
		
		styles += "<style> #draftLottery h2.index_" + t + " span.textVia:before{ content: 'via ("+e.via+")' !important;}</style>";
		
	} else {
		teamsHTML += "<h2 class='" + e.team + " index_" + t + " notChosen'><span class='logo'></span><span class='text'></span><span class='cap capOne capTwo'>" + a + "</span></h2>";
	}
	
    
    if(7 == t){ 
	    teamsHTML += "</div><div class='col-xs-16 col-md-6'>"
	}
    
}), teamsHTML += "</div></div>";
var dlHTML = "<div class='col-xs-12 col-md-6'><h3 class='players' style='display:none' contenteditable='true'></h3><h3 class='players' style='display:none' contenteditable='true'></h3><h3 class='players' style='display:none' contenteditable='true'></h3><h3 class='players' style='display:none' contenteditable='true'></h3><h3 class='players' style='display:none' contenteditable='true'></h3><h3 class='players' style='display:none' contenteditable='true'></h3><h3 class='players' style='display:none' contenteditable='true'></h3><h3 class='players' style='display:none' contenteditable='true'></h3><h3 class='players' style='display:none' contenteditable='true'></h3><h3 class='players' style='display:none' contenteditable='true'></h3><h3 class='players' style='display:none' contenteditable='true'></h3></div>",
    buttonsHTML = "<div class='col-xs-12 well well-sm'><a class='runLot btn btn-large btn-red'>START LOTTERY</a><a class='runTwo btn btn-large btn-red' style='display:none'>CONTINUE LOTTERY</a><a class='runThree btn btn-large btn-red' style='display:none'>FINISH LOTTERY</a><a class='btn btn-large btn-red pull-right' id='reset'>RESET</a><div class='mockButtons'><a class='loadDraftOrder btn btn-large btn-red disabled'>RUN MOCK</a><a class='customDraftOrder btn btn-large btn-red disabled'>CUSTOM MOCK</a><a href='#' id='shareDraft' class='twitter-share-button btn btn-red disabled'><i class='fa fa-twitter'></i> TWEET MOCK</a></div></div><div class='col-xs-12'>";
    
    wonstuffHTML = "<h2 id='winner' class='wonStuff' style='display:none'><span class='teamName text'></span><span class='playerName' contenteditable='true'></span></h2><h2 id='winnerTwo' class='wonStuff' style='display:none'><span class='teamName text'></span><span class='playerName' contenteditable='true'></span></h2><h2 id='winnerThree' class='wonStuff' style='display:none'><span class='teamName text'></span><span class='playerName' contenteditable='true'></span></h2></div>";
    
    mockDraftTableHTML = "<table id='draftTable' class='table table-striped table-bordered table-responsive table-teams'><thead class='profiler'><tr><th>Pick</th><th>Team</th><th>Player</th><th>Team</th><th>Lg.</th><th>Pos.</th><th>Ht.</th><th>Wt.</th><th>CNT</th></tr></thead><tbody>";

	//load rest of teams data
	restTeamsTableHTML = "<h3 class='restTeamsTitle'>Standings</h3><table class='table table-condensed table-bordered table-striped table-responsive table-restTeams table-teams'>";
	restTeamsTableHTML += "<tr><th>Rank</th><th colspan='2'>Team</th><th>Record</th><th>Points</th><th>ROW</th></tr>";
	
	$.each(arrayFromPHP, function(t, e) {
		standingsIndex = 31 - Number(t);
		
		//if (standingsIndex > 15) {
		restTeamsTableHTML += "<tr class='" + e['teamCap'] + "'><td width=50>" + standingsIndex + "</td><td class='draftTeams'></td><td class='team' contenteditable='false'>"+e['team']+"</td><td class='record' contenteditable='false'>"+e['record']+"</td><td class='points' contenteditable='false'>"+e['pts']+"</td><td class='row' contenteditable='false'>"+e['row']+"</td></tr>";
		//}
		
         //, t >= 0 && 16 > t && (restTeamsTableHTML += "<tr class='" + e['teamCap'] + "'><td width=50>" + restStandingsIndex + "</td><td class='draftTeams'></td><td class='team' contenteditable='false'></td></tr>")
    });
	
	standingsArrayFromPHP.reverse();
	$.each(standingsArrayFromPHP, function(t, e) {
		standingsIndex = 16 - Number(t);
		
		//if (standingsIndex > 15) {
		restTeamsTableHTML += "<tr class='" + e['teamCap'] + "'><td width=50>" + standingsIndex + "</td><td class='draftTeams'></td><td class='team' contenteditable='false'>"+e['team']+"</td><td class='record' contenteditable='false'>"+e['record']+"</td><td class='points' contenteditable='false'>"+e['pts']+"</td><td class='row' contenteditable='false'>"+e['row']+"</td></tr>";
		//}
		
         //, t >= 0 && 16 > t && (restTeamsTableHTML += "<tr class='" + e['teamCap'] + "'><td width=50>" + restStandingsIndex + "</td><td class='draftTeams'></td><td class='team' contenteditable='false'></td></tr>")
    });
	
	restTeamsTableHTML += "</table>";
	

	function modifyTeamNames(){
		
	$('#draftLottery h2.OTTAWA span.text').each(function(i, obj) {
		if($(this).find('small').length  == 0){
     		$(this).append('<small> (via OTT)</small>');
		}
	});
	
	
	}

	$(document).ready(function() {
    	$("#draftLottery").html(buttonsHTML).append(wonstuffHTML).append(teamsHTML).append(dlHTML).append(restTeamsTableHTML).append(styles);
    	
    	modifyTeamNames();
    	
	});

	$(window).load(function() {
    var getUrlParameter = function(t) {
        var e, a, s = decodeURIComponent(window.location.search.substring(1)),
            l = s.split("&");
        for (a = 0; a < l.length; a++)
            if (e = l[a].split("="), e[0] === t) return void 0 === e[1] ? !0 : e[1]
    };
    
    if (teamOne = getUrlParameter("t1"), teamTwo = getUrlParameter("t2"), teamThree = getUrlParameter("t3"), teamOne && teamTwo && teamThree) {
	    $(".restTeamsTitle").hide();
	    $(".table-restTeams").hide();
	    $("#draftLottery .wonStuff .teamName").hide();
        $(".runLot").addClass("disabled");
        $(".loadDraftOrder").addClass("disabled");
        $(".customDraftOrder").removeClass("disabled");
        
        $.each(allTeams, function(t, i) {
	        console.log(teamOne);
			if (i['id'] == teamOne){
				$("#winner").addClass(i['name'].toUpperCase()).show().addClass("showing");
				$(".teamList h2." + i['name'].toUpperCase()).removeClass("notChosen").addClass("chosen");
				teamOneName = i['name'].toUpperCase();
			} else if (i['id'] == teamTwo) {
				$("#winnerTwo").addClass(i['name'].toUpperCase()).show().addClass("showing");
				$(".teamList h2." + i['name'].toUpperCase()).removeClass("notChosen").addClass("chosen");
				teamTwoName = i['name'].toUpperCase();
			} else if (i['id'] == teamThree) {
				$("#winnerThree").addClass(i['name'].toUpperCase()).show().addClass("showing");
				$(".teamList h2." + i['name'].toUpperCase()).removeClass("notChosen").addClass("chosen");
				teamThreeName = i['name'].toUpperCase();
			}
		});

        var teams = [];
        $.each(arrayFromPHP, function(t, e) {
            teams.push(e.team)
        });
        
        standingsArrayFromPHP = standingsArrayFromPHP.filter(function(t) {
            return -1 == teams.indexOf(t);
        });
        
        var remS = teams.indexOf(teamOneName);
        remS > -1 && teams.splice(remS, 1);
        
        remS = teams.indexOf(teamTwoName);
        remS > -1 && teams.splice(remS, 1);
        
        remS = teams.indexOf(teamThreeName);
        remS > -1 && teams.splice(remS, 1);
        
        mockDraftTableHTML += "<tr class='" + teamOneName + "'><td>1</td><td class='draftTeams'></td><td class='player' contenteditable='false'></td><td class='team' contenteditable='false'></td><td class='league' contenteditable='false'></td><td class='pos' contenteditable='false'></td><td class='ht' contenteditable='false'></td><td class='wt' contenteditable='false'></td><td class='cnt' contenteditable='false'></td></tr>", mockDraftTableHTML += "<tr class='" + teamTwoName + "'><td>2</td><td class='draftTeams'></td><td class='player' contenteditable='false'></td><td class='team' contenteditable='false'></td><td class='league' contenteditable='false'></td><td class='pos' contenteditable='false'></td><td class='ht' contenteditable='false'></td><td class='wt' contenteditable='false'></td><td class='cnt' contenteditable='false'></td></tr>", mockDraftTableHTML += "<tr class='" + teamThreeName + "'><td>3</td><td class='draftTeams'></td><td class='player' contenteditable='false'></td><td class='team' contenteditable='false'></td><td class='league' contenteditable='false'></td><td class='pos' contenteditable='false'></td><td class='ht' contenteditable='false'></td><td class='wt' contenteditable='false'></td><td class='cnt' contenteditable='false'></td></tr>", $(".teamList h2").fadeOut("slow");
        
        $.each(teams, function(t, e) {
	            newIndex = Number(t) + 4;
	            
	            mockDraftTableHTML += "<tr class='" + e + "'><td>" + newIndex + "</td><td class='draftTeams'></td><td class='player' contenteditable='false'></td><td class='team' contenteditable='false'></td><td class='league' contenteditable='false'></td><td class='pos' contenteditable='false'></td><td class='ht' contenteditable='false'></td><td class='wt' contenteditable='false'></td><td class='cnt' contenteditable='false'></td></tr>"
	        });
	        
	        //standingsArrayFromPHP.reverse();
	        
	        $.each(standingsArrayFromPHP, function(t, e) {
	            restStandingsIndex = Number(t) + 1;
	            
	            
	            if ( t > 14){
		            mockDraftTableHTML += "<tr class='" + e['teamCap'] + "'><td>" + restStandingsIndex + "</td><td class='draftTeams'></td><td class='player' contenteditable='false'></td><td class='team' contenteditable='false'></td><td class='league' contenteditable='false'></td><td class='pos' contenteditable='false'></td><td class='ht' contenteditable='false'></td><td class='wt' contenteditable='false'></td><td class='cnt' contenteditable='false'></td></tr>";
		            }
	        });
	        
	        mockDraftTableHTML += "</tbody></table>";
	        
	        $("#draftLottery").append(mockDraftTableHTML);
			console.log(rankArrayFromPHP);
	        $.each(rankArrayFromPHP, function(t, e) {
	            if (0 == t){
		            firstOverall = e.playerPlain
		        };
	            
	            if (t <= 2) {
		            $("h2.showing:eq(" + t + ") span.text").addClass("noPad").parent().find(".playerName").html("" + e.playerPlain + ", " + e.pos + " | <small>" + e.team + "</small>");
		       	}
		            modifiedIndex = Number(t) + 1;
		            $("#draftTable tr:eq(" + modifiedIndex + ") td.player").html(e.player);
		            $("#draftTable tr:eq(" + modifiedIndex + ") td.team").text(e.team);
		            $("#draftTable tr:eq(" + modifiedIndex + ") td.league").html(e.league);
		            $("#draftTable tr:eq(" + modifiedIndex + ") td.pos").html(e.pos);
		            $("#draftTable tr:eq(" + modifiedIndex + ") td.ht").html(e.ht);
		            $("#draftTable tr:eq(" + modifiedIndex + ") td.wt").html(e.wt);
		            $("#draftTable tr:eq(" + modifiedIndex + ") td.cnt").html(e.cnt);
		        
	        });        
    } else {
	    
        var teams = [];
        $.each(arrayFromPHP, function(t, e) {
            teams.push(e.team)
        });
        
        standingsArrayFromPHP = standingsArrayFromPHP.filter(function(t) {
            return -1 == teams.indexOf(t);
        });
        
        
        for (var teamweight = [18.5, 13.5, 11.5, 9.5, 8.5, 7.5, 6.5, 6, 5, 3.5, 3, 2.5, 2, 1.5,1], totalweight = eval(teamweight.join("+")), weighedteams = new Array, currentteam = 0; currentteam < teams.length;) {
            for (i = 0; i < teamweight[currentteam]; i++) weighedteams[weighedteams.length] = teams[currentteam];
            currentteam++
        }
        
        
		
        $(".runLot").click(function() {
            var t = Math.floor(Math.random() * totalweight);
                e = weighedteams[t];
            $("#winner").addClass(e).show().addClass("showing");
			teamSplit = e.replaceAll(" ",".");
			$(".teamList h2." + teamSplit).removeClass("notChosen").addClass("chosen");
			mockDraftTableHTML += "<tr class='" + e + "'><td>1</td><td class='draftTeams'></td><td class='player' contenteditable='false'></td><td class='team' contenteditable='false'></td><td class='league' contenteditable='false'></td><td class='pos' contenteditable='false'></td><td class='ht' contenteditable='false'></td><td class='wt' contenteditable='false'></td><td class='cnt' contenteditable='false'></td></tr>";
            var a = "",
                s = "0";
            $.each(teamweight, function(e, l) {
                s = Number(l) + Number(s), s >= t && "" == a && (a = l)
            });
            var l = teamweight.indexOf(a);
            l > -1 && (winningPercent = teamweight[l], teamweight.splice(l, 1));
            var d = teams.indexOf(weighedteams[t]);
            d > -1 && teams.splice(d, 1);
            var n = Number(winningPercent) / 13;
            for (teamweight = teamweight.map(function(t) {
                    return t + n
                }), weighedteams = void 0, weighedteams = new Array, currentteam = 0; currentteam < teams.length;) {
                for (i = 0; i < teamweight[currentteam]; i++) weighedteams[weighedteams.length] = teams[currentteam];
                currentteam++
            }
            $.each(teamweight, function(t, e) {
                var a = Number(t);
                $(".teamList h2.notChosen:eq(" + a + ") span.cap").text("" + e.toFixed(1) + "%")
            });
			
			//set first winner for tweet
			firstWinner = e;
			//check for team's ID
			$.each(allTeams, function(t, i) {
				if (i['name'].toUpperCase() === e.toUpperCase()){
					shareUrlVar = "" + window.location.href + "?t1=" + i['id'];
				}
			});
			//console.log(shareUrlVar);
			modifyTeamNames();
            $(this).hide();
            $(".runTwo").show();
        });
		
		$(".runTwo").click(function() {
            var t = Math.floor(Math.random() * totalweight),
                e = weighedteams[t];
			teamSplit = e.replaceAll(" ",".");
            $("#winnerTwo").addClass(e).show().addClass("showing");
			$(".teamList h2." + teamSplit).removeClass("notChosen").addClass("chosen");
			
			mockDraftTableHTML += "<tr class='" + e + "'><td>2</td><td class='draftTeams'></td><td class='player' contenteditable='false'></td><td class='team' contenteditable='false'></td><td class='league' contenteditable='false'></td><td class='pos' contenteditable='false'></td><td class='ht' contenteditable='false'></td><td class='wt' contenteditable='false'></td><td class='cnt' contenteditable='false'></td></tr>";
            var a = "",
                s = "0";
            $.each(teamweight, function(e, l) {
                s = Number(l) + Number(s), s >= t && "" == a && (a = l)
            });
            var l = teamweight.indexOf(a);
            l > -1 && (winningPercent = teamweight[l], teamweight.splice(l, 1));
            var d = teams.indexOf(weighedteams[t]);
            d > -1 && teams.splice(d, 1);
            var n = Number(winningPercent) / 12;
            for (teamweight = teamweight.map(function(t) {
                    return t + n
                }), weighedteams = void 0, weighedteams = new Array, currentteam = 0; currentteam < teams.length;) {
                for (i = 0; i < teamweight[currentteam]; i++) weighedteams[weighedteams.length] = teams[currentteam];
                currentteam++
            }
            $.each(teamweight, function(t, e) {
                var a = Number(t);
                $(".teamList h2.notChosen:eq(" + a + ") span.cap").text("" + e.toFixed(1) + "%")
            });
			
            $.each(allTeams, function(t, i) {
				if (i['name'].toUpperCase() === e.toUpperCase()){
					shareUrlVar += "%26t2=" + i['id'];
				}
			});
			//console.log(shareUrlVar);
			modifyTeamNames();
            $(this).hide();
            $(".runThree").show();
        });
		
		$(".runThree").click(function() {
            var t = Math.floor(Math.random() * totalweight),
                e = weighedteams[t],
                a = teams.indexOf(weighedteams[t]);
				teamSplit = e.replaceAll(" ",".");
				
            if (a > -1){
	            teams.splice(a, 1);
	        }
            
            $("#winnerThree").addClass(e).show().addClass("showing");
            
            $(".teamList h2." + teamSplit).removeClass("notChosen").addClass("chosen");
            mockDraftTableHTML += "<tr class='" + e + "'><td>3</td><td class='draftTeams'></td><td class='player' contenteditable='false'></td><td class='team' contenteditable='false'></td><td class='league' contenteditable='false'></td><td class='pos' contenteditable='false'></td><td class='ht' contenteditable='false'></td><td class='wt' contenteditable='false'></td><td class='cnt' contenteditable='false'></td></tr>", $(".teamList h2.chosen").hide(), $(".teamList h2.notChosen").each(function(t) {
                $(".teamList h2.notChosen:eq(" + t + ") span.cap").text(Number(t) + 4);
            });
            
             $.each(allTeams, function(t, i) {
				if (i['name'].toUpperCase() === e.toUpperCase()){
					shareUrlVar += "%26t3=" + i['id'];
				}
			});
			//console.log(shareUrlVar);
			modifyTeamNames();
            $(this).addClass("disabled");
            $(".loadDraftOrder").removeClass("disabled");
        })
    }
	
    $(".loadDraftOrder").click(function() {
	        $(".teamList h2, .table-restTeams, .restTeamsTitle").fadeOut("slow");
	        $("#draftLottery .wonStuff .teamName").hide();
	        
	      
	       
	        $.each(teams, function(t, e) {
	            newIndex = Number(t) + 4;
	            
	            mockDraftTableHTML += "<tr class='" + e + "'><td>" + newIndex + "</td><td class='draftTeams'></td><td class='player' contenteditable='false'></td><td class='team' contenteditable='false'></td><td class='league' contenteditable='false'></td><td class='pos' contenteditable='false'></td><td class='ht' contenteditable='false'></td><td class='wt' contenteditable='false'></td><td class='cnt' contenteditable='false'></td></tr>"
	        });
	        
	        //standingsArrayFromPHP.reverse();
	        
	        $.each(standingsArrayFromPHP, function(t, e) {
	            restStandingsIndex = Number(t) + 16;
	            
	            
	            
		            mockDraftTableHTML += "<tr class='" + e['teamCap'] + "'><td>" + restStandingsIndex + "</td><td class='draftTeams'></td><td class='player' contenteditable='false'></td><td class='team' contenteditable='false'></td><td class='league' contenteditable='false'></td><td class='pos' contenteditable='false'></td><td class='ht' contenteditable='false'></td><td class='wt' contenteditable='false'></td><td class='cnt' contenteditable='false'></td></tr>";
		            
	        });
	        
	        mockDraftTableHTML += "</tbody></table>";
	        
	        $("#draftLottery").append(mockDraftTableHTML);
			console.log(rankArrayFromPHP);
	        $.each(rankArrayFromPHP, function(t, e) {
	            if (0 == t){
		            firstOverall = e.playerPlain
		        };
	            
	            if (t <= 2) {
		            $("h2.showing:eq(" + t + ") span.text").addClass("noPad").parent().find(".playerName").html("" + e.playerPlain + ", " + e.pos + " | <small>" + e.team + "</small>");
		       	}
		            modifiedIndex = Number(t) + 1;
		            $("#draftTable tr:eq(" + modifiedIndex + ") td.player").html(e.player);
		            $("#draftTable tr:eq(" + modifiedIndex + ") td.team").text(e.team);
		            $("#draftTable tr:eq(" + modifiedIndex + ") td.league").html(e.league);
		            $("#draftTable tr:eq(" + modifiedIndex + ") td.pos").html(e.pos);
		            $("#draftTable tr:eq(" + modifiedIndex + ") td.ht").html(e.ht);
		            $("#draftTable tr:eq(" + modifiedIndex + ") td.wt").html(e.wt);
		            $("#draftTable tr:eq(" + modifiedIndex + ") td.cnt").html(e.cnt);
		        
	        });
	        
	        $(this).addClass("disabled"), $(".customDraftOrder").removeClass("disabled");
	        
	        firstOverall = firstOverall.toLowerCase().replace(/\b[a-z]/g, function(t) {
	            return t.toUpperCase()
	        });
	        
	        firstOverall = firstOverall.replace(" ", "%20");
	        
	        firstOverall = firstOverall.split(',');
	        
	        firstOverall = firstOverall[1] + ' ' + firstOverall[0];
	        
	        firstWinner = firstWinner.toLowerCase().replace(/\b[a-z]/g, function(t) {
	            return t.toUpperCase()
	        });
	      	        
	        //shareUrlVarEncoded = encodeURI(shareUrlVar);
			//shareUrlVarEncoded = shareUrlVarEncoded.replaceAll('%20', '+');
			
			shareText = " is heading to the " + firstWinner + ", according to my #NHLDraft lottery sim at @FCHockey ~";
			shareText = encodeURIComponent(shareText);
			
			//shareUrlVar = 'https://futureconsiderations.ca/nhl-draft-lottery-simulator/?t1=1%26t2=4%26t3=5';
	        $("#shareDraft").removeClass("disabled").attr("href", "https://twitter.com/intent/tweet?text=" + firstOverall + shareText + "&url=" + shareUrlVar );
	        
    });
    
    $(".customDraftOrder").click(function() {
        $("#shareDraft").addClass("disabled");
        $(".table-teams tr td.player, .table-teams tr td.team, .table-teams tr td.league, .table-teams tr td.pos, .table-teams tr td.ht, .table-teams tr td.wt, .table-teams tr td.cnt").empty();
        $(".wonStuff small").html("<small></small>");
        $(".wonStuff img").hide(), $("h2.showing").addClass("listening");
        
        $("[contenteditable='false']").each(function() {
            $(this).attr("contentEditable", !0)
        });
        
        $(".table-teams tr:eq(1) td.player, .table-teams tr:eq(1) td.team, .table-teams tr:eq(1) td.pos").keyup(function() {
            var t = $("#draftTable tr:eq(1) td.player").text();
                e = $("#draftTable tr:eq(1) td.team").text();
                a = $("#draftTable tr:eq(1) td.pos").text();
                
            $("h2#winner.listening small").html("" + t + ", " + a + " | <small>" + e + "</small>");
        });
        
         $(".table-teams tr:eq(2) td.player, .table-teams tr:eq(2) td.team, .table-teams tr:eq(2) td.pos").keyup(function() {
            var t = $("#draftTable tr:eq(2) td.player").text();
                e = $("#draftTable tr:eq(2) td.team").text();
                a = $("#draftTable tr:eq(2) td.pos").text();
            $("h2#winnerTwo.listening small").html("" + t + ", " + a + " | <small>" + e + "</small>");
            
        });
        
        $(".table-teams tr:eq(3) td.player, .table-teams tr:eq(3) td.team, .table-teams tr:eq(3) td.pos").keyup(function() {
            var t = $("#draftTable tr:eq(3) td.player").text(),
                e = $("#draftTable tr:eq(3) td.team").text(),
                a = $("#draftTable tr:eq(3) td.pos").text();
            $("h2#winnerThree.listening small").html("" + t + ", " + a + " | <small>" + e + "</small>")
        });
        
    });
    
    $("#reset").click(function() {
        var t = window.location.href;
            e = t.indexOf("?");
			t = t.substring(0, -1 != e ? e : t.length);
			window.location = t;
    })
});

})( jQuery );