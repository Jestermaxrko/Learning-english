
//firebase.database().ref().set({id:0});

/*document.getElementById('file').onchange = function(){

  var file = this.files[0];

  var reader = new FileReader();
  reader.onload = function(progressEvent){
    // Entire file
  
    // By lines
    var lines = this.result.split('\n');
    
    var all_words = [];

    for(var i=0;i<lines.length;i++){

      console.log("yes");

       var words = lines[i].split(";");
       var to_push = {
        id:i,
        eng:words[0],
        rus:words[1]
       }
       all_words.push(to_push);

       firebase.database().ref('fromENG').push(to_push);
    }
   
    console.log(all_words);

  };
  reader.readAsText(file);
};*/


const DAILY =1;
const RANDOM =2;
const CUSTOM =3;
var type = DAILY; 
var all_words = [];
var current_words = [];
var cur_word_index = -1;
var right_word_indexes = [];
var wrong_words_index = [];
var all_days = [];
var cur_day;
var updateFB = false;
var fromWrong = false;
var test_is_started = false;

firebase.database().ref('fromENG').once('value').then(function(snapshot) {
  var words = snapshot.val();
 
  for(var key in words){
    words[key].uid = key;
    all_words.push(words[key]);
  }

});


firebase.database().ref('days').once('value').then(function(snapshot) {
  var days = snapshot.val();
 
  for(var key in days){
    days[key].uid = key;
    all_days.push(days[key]);
  }
  console.log(all_days);
  loadDaily(document.getElementById("daily"));

});


function createDayTest(day){

  current_words = [];
  
  for(var i=0;i<all_days.length;i++){
    if(all_days[i].day==day){
      cur_day = all_days[i];break;
    }
  }

  console.log(cur_day);
  var indexes = cur_day.indexes.split(" ");

  for(var i =0;i<indexes.length;i++){
    current_words.push(all_words[indexes[i]]);
  }
}

function createRandomWordsTest(){

  current_words = [];
  for(var i =0;i<40;i++){
    var index = current_index = Math.floor((Math.random() * all_words.length) + 1);
    current_words.push(all_words[index]);
  }
 
}
  
function updateLine(index){

  var len = current_words.length;

  var percents = index*100/len;

  document.getElementById("line").style.width = percents+"%";
}

function nextWord(){


    document.getElementById("input_panel").style.display = "";
    document.getElementById("answer_panel").style.display = "none";
    //document.getElementById("answer").innerHTML= "";
    document.getElementById("word_input").focus();
    cur_word_index++;
    updateLine(cur_word_index+1);

    document.getElementById("number").innerHTML = cur_word_index+1 +"/" + current_words.length;

    console.log(current_words.length);

    if(cur_word_index>=current_words.length){
      
      loadResults();
    }
    else {
      console.log(cur_word_index);
      document.getElementById("word").innerHTML = current_words[cur_word_index].rus;
    }
    
}
function check(value,e){
  if(e.key == "Enter"){
   checkWord(value);
  }
}

function checkWord(word){


	if(current_words[cur_word_index].eng[current_words[cur_word_index].eng.length-1]==".")
		current_words[cur_word_index].eng.length = current_words[cur_word_index].eng.length-1;

	console.log(current_words[cur_word_index].eng);


    if(word.toLowerCase()==current_words[cur_word_index].eng.toLowerCase()){
      right_word_indexes.push(current_words[cur_word_index].id);
      document.getElementById("answer").className = "rigth";
    }
    else {
      wrong_words_index.push(current_words[cur_word_index].id);
      document.getElementById("answer").className = "wrong";
    }

    document.getElementById("rus_answer").innerHTML =  current_words[cur_word_index].rus; 
    document.getElementById("eng_answer").innerHTML =  current_words[cur_word_index].eng;
    document.getElementById("eng_answer").href =  "https://translate.google.com.ua/#en/uk/"+current_words[cur_word_index].eng;


    document.getElementById("input_panel").style.display = "none";
    document.getElementById("answer_panel").style.display = "";

    document.getElementById("next_btn").focus();
    document.getElementById("word_input").value ="";

    //nextWord();
}

function loadDaily(new_elem){

  if(!test_is_started){

    var elem = document.getElementsByClassName("selected")[0];
    elem.classList.remove("selected");
    new_elem.classList.add("selected");

    document.getElementById("results_page").style.display="none";
    document.getElementById("all_days").style.display="none";
    document.getElementById("start_page").style.display = "";
    type = DAILY;
    updateFB = true;
    document.getElementById("test_title").innerHTML = "Daily";
    selectTest();
  }
}

function loadRandom(new_elem){

  if(!test_is_started){
    var elem = document.getElementsByClassName("selected")[0];
    elem.classList.remove("selected");
    new_elem.classList.add("selected");
    document.getElementById("results_page").style.display="none";
    document.getElementById("all_days").style.display="none";
    document.getElementById("start_page").style.display = "";
    type = RANDOM;
    updateFB = false;
    document.getElementById("test_title").innerHTML = "Random";
    selectTest();
  }
}

function selectTest(){

  current_words = [];
  cur_word_index = -1;
  right_word_indexes = [];
  wrong_words_index = [];
  fromWrong = false;

  switch(type){
    case DAILY:createDayTest(getOwnDate(0));break;
    case RANDOM:createRandomWordsTest();break;
  }
}


function startTest(){

  test_is_started = true;

  document.getElementById("start_page").style.display="none";
  document.getElementById("test_panel").style.display="";
  document.getElementById("results_page").style.display="none";
  document.getElementById("all_days").style.display = "none";

  nextWord();
}


function restartAll(){

  cur_word_index = -1;
  right_word_indexes = [];
  wrong_words_index = []; 

  if(!fromWrong)
    updateFB = true;
  else updateFB = false;
  startTest();
}

function restartWrong(){

  updateFB = false;
  fromWrong = true;
  current_words = [];

  for(var i=0;i<wrong_words_index.length;i++){
    current_words.push(all_words[wrong_words_index[i]]);
  }

   cur_word_index = -1;
   right_word_indexes = [];
   wrong_words_index = []; 

   startTest();

}

function loadResults(){

  document.getElementById("results_page").style.display="";
  document.getElementById("test_panel").style.display="none";
  test_is_started = false;

  var res_title = document.getElementById("results");

  res_title.innerHTML =  "Result </br>" + right_word_indexes.length +" of "+current_words.length;

  if(updateFB){
      cur_day.wrong_indexes = arrayToString(wrong_words_index);
      cur_day.right_indexes = arrayToString(right_word_indexes);
      firebase.database().ref('days/'+cur_day.uid).set(cur_day);
  }

  loadWordsTable();
  updateWrongWords();


}

function arrayToString(arr){

  var str = "";

  for(var i=0;i<arr.length;i++){
    if(i==0)  str+=arr[i];
    else  str+=" "+arr[i];
  }
  return str;
}

function stringSize(str){

  var arr = str.split(" ");
  return arr.length;
}


function loadDays(new_elem){

  if(!test_is_started){

    var elem = document.getElementsByClassName("selected")[0];
    elem.classList.remove("selected");
    new_elem.classList.add("selected");

    document.getElementById("all_days").style.display = "";
    document.getElementById("start_page").style.display = "none";
    document.getElementById("results_page").style.display = "none";

    var table = document.getElementById("table");
    table.innerHTML = "";
    for(var i=0;i<all_days.length;i++){
      var row = table.insertRow(i);

      for(var j=0;j<6;j++){

        var cell = row.insertCell(j);

        switch(j){

          case 0: cell.innerHTML = "Lesson "+(i+1);break; 
          case 1: cell.innerHTML = all_days[i].day;break;
          case 2: {


            if(!all_days[i].wrong_indexes && !all_days[i].right_indexes){
              cell.innerHTML = "0/" + stringSize(all_days[i].indexes);
              cell.className = "red_points";
            }else {

              if(all_days[i].right_indexes && !all_days[i].wrong_indexes){
                cell.innerHTML = stringSize(all_days[i].right_indexes)+"/"+stringSize(all_days[i].indexes);
                cell.className = "green_points";
              }

              if(!all_days[i].right_indexes && all_days[i].wrong_indexes){
                cell.innerHTML = "0/"+stringSize(all_days[i].indexes);
                cell.className = "red_points";
              }         
              if(all_days[i].right_indexes && all_days[i].wrong_indexes){
                cell.innerHTML = stringSize(all_days[i].right_indexes)+"/"+stringSize(all_days[i].indexes);
              } 
            }
            break;
          }

          case 3: {

            var start_all = document.createElement("input");
            start_all.type = "button";
            start_all.value = "All";
            start_all.id = i;
            start_all.setAttribute("onclick","loadCustomDay(this.id)");
            cell.appendChild(start_all);
            start_all.className = "table_btn";
            break;
          }

          case 4: {

            var start_all = document.createElement("input");
            start_all.type = "button";
            start_all.value = "Wrong";
            start_all.id = i;
            start_all.setAttribute("onclick","loadCustomDayWrong(this.id)");
            cell.appendChild(start_all);
            start_all.className = "table_btn wrong_btn";
            break;
          }

          case 5:{

            var start_all = document.createElement("input");
            start_all.type = "button";
            start_all.value = "List";
            start_all.id = i;
            start_all.setAttribute("onclick","loadDaysWordsTable(this.id)");
            cell.appendChild(start_all);
            start_all.className = "table_btn";
            break;
          }

        }

      }
    }

  }

}

function loadCustomDay(id){
  document.getElementById("results_page").style.display="none";
  console.log(id);
  current_words = [];
  cur_word_index = -1;
  right_word_indexes = [];
  wrong_words_index = [];
  updateFB = true;
  fromWrong = false;

  var arr = all_days[id].indexes.split(" ");
  console.log(arr);

  cur_day = all_days[id];

  for(var i=0;i<arr.length;i++){
    current_words.push(all_words[arr[i]]);
  }

  console.log(current_words);

  startTest();
}

function loadCustomDayWrong(id){
  
  document.getElementById("results_page").style.display="none";
  console.log(id);
  current_words = [];
  cur_word_index = -1;
  right_word_indexes = [];
  wrong_words_index = [];
  updateFB = false;
  fromWrong = true;

  var arr = all_days[id].wrong_indexes.split(" ");
  console.log(arr);

  cur_day = all_days[id];

  for(var i=0;i<arr.length;i++){
    current_words.push(all_words[arr[i]]);
  }

  console.log(current_words);

  startTest();
  
}


function updateWrongWords(){


  firebase.database().ref('fromEngWrong').once('value').then(function(snapshot) {
    var snp = snapshot.val();

    if(snp){
      var all_wrong = snp.split(" ");
      if(+all_wrong[0]==-1) all_wrong.splice(0,1);

      for(var i=0;i<right_word_indexes.length;i++){
        for(var j=0;j<all_wrong.length;j++){
          if(right_word_indexes[i]==all_wrong[j]){
            all_wrong.splice(j, 1);
          }
        }
      }


      for(var i=0;i<wrong_words_index.length;i++){
        var is_in = false;
        for(var j=0;j<all_wrong.length;j++){

          if(wrong_words_index[i]==all_wrong[j]){
            is_in= true;break;
          }
        }
        if(!is_in)
          all_wrong.push(wrong_words_index[i]);
      }

       if(all_wrong.length>0){
         var all_wrong_str = arrayToString(all_wrong)+"";
         firebase.database().ref('fromEngWrong').set(all_wrong_str);
        }else{
          firebase.database().ref('fromEngWrong').set("-1");
        }
   }
  });

}


function loadWordsTable(){

  var table = document.getElementById("words");
  var switch_btn = document.getElementById("switchTable");
  switch_btn.value = "Display wrong";
  switch_btn.setAttribute("onclick","loadWrongWordsTable()");
  table.innerHTML = "";

  for(var i=0;i<current_words.length;i++){
    

    var row = table.insertRow(i);

    console.log("id :" + current_words[i].id);
    console.log(wrong_words_index);

    if(isInWrong(current_words[i].id)){
      console.log();
      row.className = "red";
    }

    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);

    cell1.innerHTML = current_words[i].eng;
    cell2.innerHTML = current_words[i].rus; 
  }
}

function loadWrongWordsTable(){


  var table = document.getElementById("words");
  var switch_btn = document.getElementById("switchTable");
  switch_btn.value = "Dislpay all";
  switch_btn.setAttribute("onclick","loadWordsTable()");
  table.innerHTML = "";
  var inserted_count =0;

  for(var i=0;i<current_words.length;i++){
    if(isInWrong(current_words[i].id)){
      var row = table.insertRow(inserted_count++);
      row.className = "red";
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);

      cell1.innerHTML = current_words[i].eng;
      cell2.innerHTML = current_words[i].rus; 
    }
  }
}


function loadDaysWordsTable(id){

  document.getElementById("lesson").innerHTML= "Lesson " +(+id+1) + " words";
  var table = document.getElementById("days_word");
  table.innerHTML = "";


   var arr = all_days[id].indexes.split(" ");
   var wrong_arr = all_days[id].wrong_indexes || "-1";
   wrong_arr =wrong_arr.split(" ");

  for(var i=0;i<arr.length;i++){
    
    var row = table.insertRow(i);
    console.log(all_words[arr[i]].id);
    if(isInWrongDays(all_words[arr[i]].id,wrong_arr)){
      console.log();
      row.className = "red";
    }
    
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);

    cell1.innerHTML = all_words[arr[i]].eng;
    cell2.innerHTML = all_words[arr[i]].rus; 
  }
}

function isInWrong(val){

  var is_in = false;
  for(var i=0;i<wrong_words_index.length;i++){

    if(val==wrong_words_index[i]){
      is_in = true;break;
    }
  }
  return is_in;
}


function isInWrongDays(val,arr){

  var is_in = false;
  for(var i=0;i<arr.length;i++){

    if(val==arr[i]){
      is_in = true;break;
    }
  }
  return is_in;
}


function hearWord(){
	var msg = new SpeechSynthesisUtterance(current_words[cur_word_index].eng);
	window.speechSynthesis.speak(msg);
}



/*function createDays(){
  var count = 0;
  var limit = 30;
  var days = [];
  var days_count =0;

  var day ="";
  for(var i=0;i<all_words.length;i++){

    if(i==0){
      day += i;
    }
    else {
      day +=" "+i;
    }
    
    count++;
      
    if(count==limit){
      count =0;
      var newdate = getOwnDate(days_count);
      days_count++;
      var to_push = {
        indexes : day,
        day: newdate
      }

      days.push(to_push);
      day="";
    }

    if(i==all_words.length-1){

      var newdate = getOwnDate(days_count);
      days_count++;
      var to_push = {
        indexes : day,
        day: newdate
      }

      days.push(to_push);
    }

  }

  
  for(var i =0;i<days.length;i++){

    firebase.database().ref('days').push(days[i]);

  }

}*/


function getOwnDate(i){

    var now = new Date();
    var today = new Date();
    now.setDate(today.getDate()+i);
    var month = now.getMonth() + 1; //months from 1-12
    var day_s = now.getDate();
    var year = now.getFullYear();
    var newdate = year + "/" + month + "/" + day_s;
    return newdate;
}


