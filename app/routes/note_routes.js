module.exports = function(app) {
    var vkTokenKey = 'c23817f69c7d06ad018317543d6b54100e2ead2373adaf8c9e8b76ce7bef1fe7d079e424c63322cb120de';
    app.get('/fssp', (req, res) => {
        request(req.body.region, req.body.firstname, req.body.lastname, req.body.birthdate, check, res);
    });
    
    app.get('/vksearch', (req, res) => {
        vkSearchCountry(req.body.firstname, req.body.lastname, req.body.country, req.body.city, req.body.birth_day, req.body.birth_month, vkSearchCity, res, vkTokenKey)
    });
    
    app.get('/vkmutualfriends', (req, res) => {
        vkSearchMutualFriends(req.body.firstid, req.body.lastid, vkSendMutualFriends, res, vkTokenKey)
    });
    
    app.get('/vkarefriends', (req, res) => {
        vkAreFriends(req.body.firstid, req.body.lastid, vkSendAreFriendsResult, res, vkTokenKey)
    });
    
    app.get('/vkinterests', (req, res) => {
        vkinterests(req.body.id, vkTokenKey, vkSendInterests, res);
    });
};

function request(region, firstname, lastname, birthdate, callback, appResponse){
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xhr = new XMLHttpRequest();
    
    var www = 'https://api-ip.fssprus.ru/api/v1.0/search/physical?token=4dLPtEZ2DmWc&region=' + region + '&firstname=' + firstname + '&lastname=' + lastname+'&birthdate=' + birthdate;
    var res = encodeURI(www);
    xhr.open('GET', res, true);    
    xhr.onload = function(t) {
        var json = this.responseText, obj = JSON.parse(json);
        var response = JSON.stringify(obj.response);
        var obj2 = JSON.parse(response);
        var task = obj2.task;
        callback(task, answer, appResponse);
        return task;
    }

    xhr.onerror = function() {
        console.log( 'Ошибка ' + this.status );
    }

    xhr.send(null);
}

function check(task, callback, appResponse){
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xhr2 = new XMLHttpRequest();
    var www = 'https://api-ip.fssprus.ru/api/v1.0/result?token=4dLPtEZ2DmWc&task=' + task;
    xhr2.open('GET', 'https://api-ip.fssprus.ru/api/v1.0/result?token=4dLPtEZ2DmWc&task=' + task, true);
    xhr2.onload = function(){
        var json = this.responseText, obj = JSON.parse(json);
        var response = JSON.stringify(obj.response);
        var obj2 = JSON.parse(response);
        var result = JSON.stringify(obj2.result);
        
        var obj3 = JSON.parse(result);
        var finalResult = JSON.stringify(obj3);
        callback(finalResult, appResponse);
    }
    
    xhr2.onerror = function() {
        console.log( 'Ошибка ' + this.status );
    }

    xhr2.send(null);
}

function answer(result, appResponse){
    appResponse.send(result);
    console.log('Succesfull fssp');
}


function vkSearchCountry(firstname, lastname, country, city, birthday, birthmonth, callback, appResponse, vkTokenKey){
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xhr = new XMLHttpRequest();
    
    var www = 'https://api.vk.com/method/database.getCountries?code=' + country + '&count=1&access_token=' + vkTokenKey + '&v=5.95';
    var res = encodeURI(www);
    xhr.open('GET', res, true); 
    xhr.onload = function() {
        var json = this.responseText, obj = JSON.parse(json);
        var response = JSON.stringify(obj.response);
        var objdata = JSON.parse(response);
        var data = JSON.stringify(objdata);
        var objcountry = JSON.parse(data).items[0];
        var country = JSON.stringify(objcountry);
        var id = JSON.parse(country).id;
        callback(firstname, lastname, city, birthday, birthmonth, vkUserSearch, id, appResponse, vkTokenKey);
    }

    xhr.onerror = function() {
        console.log( 'Ошибка ' + this.status );
    }

    xhr.send(null);
}

function vkSearchCity(firstname, lastname, city, birthday, birthmonth, callback, idcountry, appResponse, vkTokenKey){
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xhr = new XMLHttpRequest();
    if (idcountry == 0)
        callback(firstname, lastname, 0, birthday, birthmonth, vkSendUser, appResponse, vkTokenKey);
    else {
        var www = 'https://api.vk.com/method/database.getCities?country_id=' + idcountry + '&q='+ city +'&count=1&access_token=' + vkTokenKey + '&v=5.95';
        var res = encodeURI(www);
        xhr.open('GET', res, true);    
        xhr.onload = function() {
            var json = this.responseText, obj = JSON.parse(json);
            var response = JSON.stringify(obj.response);
            var objdata = JSON.parse(response);
            var data = JSON.stringify(objdata);
            if (JSON.parse(data).count == 0)
                callback(firstname, lastname, 0, birthday, birthmonth, vkSendUser, appResponse, vkTokenKey);
            else {
                var objcountry = JSON.parse(data).items[0];
                var country = JSON.stringify(objcountry);
                var idcity = JSON.parse(country).id;
                callback(firstname, lastname, idcity, birthday, birthmonth, vkSendUser, appResponse, vkTokenKey);                 
            }               
        }

        xhr.onerror = function() {
            console.log( 'Ошибка ' + this.status );
        }

        xhr.send(null);        
    } 
}

function vkUserSearch(firstname, lastname, city, birth_day, birth_month, callback, appResponse, vkTokenKey){
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xhr = new XMLHttpRequest();
    if (city == 0)
        callback('Error', appResponse);
    else {
        var www = 'https://api.vk.com/method/users.search?q=' + lastname + '+' + firstname + '&count=1000&fields=screen_name,bdate&city='+city+'&birth_day='+birth_day+'&birth_month='+birth_month+'&access_token=' + vkTokenKey + '&v=5.92';
        var res = encodeURI(www);
        xhr.open('GET', res, true);    
        xhr.onload = function(t) {
            var json = this.responseText, obj = JSON.parse(json);
            var response = JSON.stringify(obj.response);
            if (typeof response == "undefined")
                callback('Error', appResponse);
            else {
                var objdata = JSON.parse(response).items;
                var user = JSON.stringify(objdata);
                callback(user, appResponse);                
            }
        }

        xhr.onerror = function() {
            console.log( 'Ошибка ' + this.status );
        }

        xhr.send(null);        
    }
}

function vkSendUser(user, appResponse){    
    appResponse.send(user);
    console.log('Succesfull vk id');
}


function vkSearchMutualFriends(firstid, lastid, callback, appResponse, vkTokenKey){
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xhr = new XMLHttpRequest();
    
    var www = 'https://api.vk.com/method/friends.getMutual?source_uid=' + firstid + '&target_uid=' + lastid + '&access_token=' + vkTokenKey + '&v=5.95';
    var res = encodeURI(www);
    xhr.open('GET', res, true); 
    xhr.onload = function() {
        var json = this.responseText, obj = JSON.parse(json);
        var response = JSON.stringify(obj.response);
        callback(response, appResponse);
    }

    xhr.onerror = function() {
        console.log( 'Ошибка ' + this.status );
    }

    xhr.send(null);
}

function vkSendMutualFriends(mutualFriend, appResponse){    
    appResponse.send(mutualFriend);
    console.log('Succesfull vk mutual friends');
}


function vkAreFriends(firstid, lastid, callback, appResponse, vkTokenKey){
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xhr = new XMLHttpRequest();

    
    var www = 'https://api.vk.com/method/friends.get?user_id=' + firstid + '&access_token=' + vkTokenKey + '&v=5.95';
    var res = encodeURI(www);
    xhr.open('GET', res, true); 
    xhr.onload = function() {
        const arrayFindIndex = require('array-find-index');
        var json = this.responseText, obj = JSON.parse(json);
        var response = JSON.stringify(obj.response);
        if(typeof response == "undefined")
            callback('Error', appResponse);
        else {
            var obj2 = JSON.parse(response);
            var friends = obj2.items;
            var a = arrayFindIndex(friends, x => x == lastid);
            var areFriends = false;
            if (a > -1) areFriends = true;
            callback(areFriends, appResponse);                
        }

    }

    xhr.onerror = function() {
        console.log( 'Ошибка ' + this.status );
    }

    xhr.send(null);
}

function vkSendAreFriendsResult(friends, appResponse){    
    appResponse.send(friends);
    console.log('Succesfull vk arefriends');
}


function vkinterests(id, vkTokenKey, callback, appResponse){
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xhr = new XMLHttpRequest();
    var www = 'https://api.vk.com/method/users.getSubscriptions?user_id=' + id + '&count=100&extended=1&fields=activity&access_token=' + vkTokenKey + '&v=5.95';
    var res = encodeURI(www);
    xhr.open('GET', res, true); 
    xhr.onload = function() {
        var response = JSON.parse(this.responseText);
        if(typeof response.response == "undefined")
            callback('Error', appResponse);
        else {
            var listInterests = response.response.items;
            var interests = [];
            listInterests.forEach(function(item, i, listInterests) {
                interests[interests.length] = item.activity;
            })
            var result = {};
            for (var i = 0; i < interests.length; ++i)
            {
            var interest = interests[i];
            if (result[interest] != undefined)
                ++result[interest];
            else
                result[interest] = 1;
            }
            for (var key in result)

            var items = Object.keys(result).map(function(key) {
                return [key, result[key]];
            });
            
            if(typeof items == "undefined")
                callback('No interests', appResponse);
            else {
                items.sort(function(first, second) {
                    return second[1] - first[1];
                });
                var interestsResult = (items.slice(0, 8));
                callback(interestsResult, appResponse);                  
            }          
        }
    }

    xhr.onerror = function() {
        console.log( 'Ошибка ' + this.status );
    }

    xhr.send(null);
}

function vkSendInterests(interests, appResponse){    
    appResponse.send(interests);
    console.log('Succesfull vk interests');
}


