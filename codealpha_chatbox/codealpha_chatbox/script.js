(function(){

  var STORE_KEY = 'cardbox_flashcards_v1';

  var state = {
    cards: [],
    index: 0,
    showingAnswer: false,
    editingId: null
  };

  function load(){
    try{
      var raw = localStorage.getItem(STORE_KEY);
      if(raw){
        state.cards = JSON.parse(raw);
      }
    }catch(e){
      state.cards = [];
    }

    if(!Array.isArray(state.cards)){
      state.cards = [];
    }
  }

  function save(){
    try{
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify(state.cards)
      );
    }catch(e){}
  }

  function uid(){
    return 'c' +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2,6);
  }

  var cardEl = document.getElementById('card');
  var progressEl = document.getElementById('progress');
  var listEl = document.getElementById('list');
  var addForm = document.getElementById('addForm');
  var qInput = document.getElementById('qInput');
  var aInput = document.getElementById('aInput');

  function clampIndex(){

    if(state.cards.length === 0){
      state.index = 0;
      return;
    }

    if(state.index >= state.cards.length){
      state.index = state.cards.length - 1;
    }

    if(state.index < 0){
      state.index = 0;
    }
  }

  function renderCard(){

    clampIndex();

    if(state.cards.length === 0){

      cardEl.innerHTML =
        '<div class="empty">' +
        'No cards yet — add one below to start studying.' +
        '</div>';

      progressEl.textContent = '';
      return;
    }

    var c = state.cards[state.index];

    progressEl.textContent =
      'Card ' +
      (state.index + 1) +
      ' of ' +
      state.cards.length;

    if(state.showingAnswer){

      cardEl.innerHTML =
        '<div class="tag answer">Answer</div>' +
        '<p>' +
        escapeHtml(c.a || '(no answer yet)') +
        '</p>' +
        '<div class="hint">Tap to flip back</div>';

    }else{

      cardEl.innerHTML =
        '<div class="tag">Question</div>' +
        '<p>' +
        escapeHtml(c.q || '(no question yet)') +
        '</p>' +
        '<div class="hint">Tap to show answer</div>';
    }
  }

  function renderList(){

    if(state.cards.length === 0){
      listEl.innerHTML = '';
      return;
    }

    listEl.innerHTML = '';

    state.cards.forEach(function(c, i){

      var row = document.createElement('div');

      row.className =
        'item' +
        (i === state.index ? ' current' : '');

      var q = document.createElement('div');

      q.className = 'q';

      q.textContent =
        (i + 1) +
        '. ' +
        (c.q || '(blank)');

      row.appendChild(q);

      var editBtn =
        document.createElement('button');

      editBtn.className = 'iconbtn';
      editBtn.textContent = 'Edit';

      editBtn.onclick = function(){
        openEdit(c.id);
      };

      var delBtn =
        document.createElement('button');

      delBtn.className = 'iconbtn del';
      delBtn.textContent = 'Delete';

      delBtn.onclick = function(){
        deleteCard(c.id);
      };

      row.appendChild(editBtn);
      row.appendChild(delBtn);

      row.onclick = function(e){

        if(
          e.target === editBtn ||
          e.target === delBtn
        ){
          return;
        }

        state.index = i;
        state.showingAnswer = false;

        renderAll();
      };

      listEl.appendChild(row);
    });
  }

  function renderAll(){
    renderCard();
    renderList();
  }

  function escapeHtml(s){

    return String(s).replace(
      /[&<>"']/g,
      function(m){

        return {
          '&':'&amp;',
          '<':'&lt;',
          '>':'&gt;',
          '"':'&quot;',
          "'":'&#39;'
        }[m];

      }
    );
  }

  cardEl.addEventListener('click', function(){

    if(state.cards.length === 0){
      return;
    }

    state.showingAnswer =
      !state.showingAnswer;

    renderCard();
  });

  document.getElementById('flipBtn').onclick =
    function(){

      if(state.cards.length === 0){
        return;
      }

      state.showingAnswer =
        !state.showingAnswer;

      renderCard();
    };

  document.getElementById('prevBtn').onclick =
    function(){

      if(state.cards.length === 0){
        return;
      }

      state.index =
        (state.index - 1 + state.cards.length) %
        state.cards.length;

      state.showingAnswer = false;

      renderAll();
    };

  document.getElementById('nextBtn').onclick =
    function(){

      if(state.cards.length === 0){
        return;
      }

      state.index =
        (state.index + 1) %
        state.cards.length;

      state.showingAnswer = false;

      renderAll();
    };

  var addTrigger =
    document.getElementById('addTrigger');

  addTrigger.onclick = function(){

    state.editingId = null;

    qInput.value = '';
    aInput.value = '';

    addForm.classList.add('open');

    addTrigger.style.display = 'none';

    qInput.focus();
  };

  document.getElementById('cancelForm').onclick =
    closeForm;

  function closeForm(){

    addForm.classList.remove('open');

    addTrigger.style.display = 'block';

    state.editingId = null;
  }

  function openEdit(id){

    var c =
      state.cards.find(function(x){
        return x.id === id;
      });

    if(!c){
      return;
    }

    state.editingId = id;

    qInput.value = c.q;
    aInput.value = c.a;

    addForm.classList.add('open');

    addTrigger.style.display = 'none';

    qInput.focus();
  }

  document.getElementById('saveForm').onclick =
    function(){

      var q = qInput.value.trim();
      var a = aInput.value.trim();

      if(!q && !a){
        closeForm();
        return;
      }

      if(state.editingId){

        var c =
          state.cards.find(function(x){
            return x.id === state.editingId;
          });

        if(c){
          c.q = q;
          c.a = a;
        }

      }else{

        state.cards.push({
          id: uid(),
          q: q,
          a: a
        });

        state.index =
          state.cards.length - 1;

        state.showingAnswer = false;
      }

      save();
      closeForm();
      renderAll();
    };

  function deleteCard(id){

    var i =
      state.cards.findIndex(function(x){
        return x.id === id;
      });

    if(i === -1){
      return;
    }

    state.cards.splice(i, 1);

    if(
      state.index >= state.cards.length
    ){
      state.index =
        Math.max(0, state.cards.length - 1);
    }

    state.showingAnswer = false;

    save();
    renderAll();
  }


  /* =========================================
     100 INTERNSHIP PROJECT VIVA QUESTIONS
     ========================================= */

  load();

  if(state.cards.length === 0){

    state.cards = [

      {
        id: uid(),
        q: 'What is the name of your project?',
        a: 'Card Box – Flashcard Study App.'
      },

      {
        id: uid(),
        q: 'What is the main purpose of the project?',
        a: 'It is used to create and study question-and-answer flashcards.'
      },

      {
        id: uid(),
        q: 'What type of application is it?',
        a: 'It is a web-based application.'
      },

      {
        id: uid(),
        q: 'Where does the application run?',
        a: 'It runs in a web browser.'
      },

      {
        id: uid(),
        q: 'Does the project require a server?',
        a: 'No. The current project can run without a server.'
      },

      {
        id: uid(),
        q: 'Does the project require installation?',
        a: 'No. It can be opened directly in a modern browser.'
      },

      {
        id: uid(),
        q: 'What are the main files?',
        a: 'index.html, style.css, and script.js.'
      },

      {
        id: uid(),
        q: 'What is the role of index.html?',
        a: 'It creates the structure of the webpage.'
      },

      {
        id: uid(),
        q: 'What is the role of style.css?',
        a: 'It controls the design and appearance of the webpage.'
      },

      {
        id: uid(),
        q: 'What is the role of script.js?',
        a: 'It controls the functionality and logic of the application.'
      },

      {
        id: uid(),
        q: 'What is HTML?',
        a: 'HTML is used to create the structure of a webpage.'
      },

      {
        id: uid(),
        q: 'What does HTML stand for?',
        a: 'HyperText Markup Language.'
      },

      {
        id: uid(),
        q: 'What is the purpose of the body tag?',
        a: 'It contains the visible content of the webpage.'
      },

      {
        id: uid(),
        q: 'What is the purpose of the header?',
        a: 'It displays the project title and progress information.'
      },

      {
        id: uid(),
        q: 'What is the purpose of the card?',
        a: 'It displays the question or answer.'
      },

      {
        id: uid(),
        q: 'What does the Previous button do?',
        a: 'It moves to the previous flashcard.'
      },

      {
        id: uid(),
        q: 'What does the Next button do?',
        a: 'It moves to the next flashcard.'
      },

      {
        id: uid(),
        q: 'What does the Show answer button do?',
        a: 'It displays the answer of the current card.'
      },

      {
        id: uid(),
        q: 'What does Add a card do?',
        a: 'It opens a form for entering a new question and answer.'
      },

      {
        id: uid(),
        q: 'What fields are present in the add-card form?',
        a: 'Question and Answer fields.'
      },

      {
        id: uid(),
        q: 'What is CSS?',
        a: 'CSS is used to style and design webpages.'
      },

      {
        id: uid(),
        q: 'What does CSS stand for?',
        a: 'Cascading Style Sheets.'
      },

      {
        id: uid(),
        q: 'Why is CSS used in this project?',
        a: 'It makes the application clean, readable, and responsive.'
      },

      {
        id: uid(),
        q: 'What is responsive design?',
        a: 'It allows the webpage to adjust to different screen sizes.'
      },

      {
        id: uid(),
        q: 'What font is used for normal text?',
        a: 'Inter font.'
      },

      {
        id: uid(),
        q: 'What font is used for headings?',
        a: 'Newsreader font.'
      },

      {
        id: uid(),
        q: 'Does the project support dark mode?',
        a: 'Yes, the CSS contains dark-mode styling.'
      },

      {
        id: uid(),
        q: 'What is a CSS variable?',
        a: 'It is a reusable value used for CSS properties.'
      },

      {
        id: uid(),
        q: 'What is background used for?',
        a: 'It controls the background appearance.'
      },

      {
        id: uid(),
        q: 'What is border-radius used for?',
        a: 'It makes the corners of elements rounded.'
      },

      {
        id: uid(),
        q: 'What is JavaScript?',
        a: 'JavaScript makes webpages interactive and dynamic.'
      },

      {
        id: uid(),
        q: 'Why is JavaScript used in this project?',
        a: 'It manages flashcards and user interactions.'
      },

      {
        id: uid(),
        q: 'What is a variable?',
        a: 'A variable stores data used by a program.'
      },

      {
        id: uid(),
        q: 'What is the state object?',
        a: 'It stores the current application data.'
      },

      {
        id: uid(),
        q: 'What is state.cards?',
        a: 'It contains all the flashcards.'
      },

      {
        id: uid(),
        q: 'What is state.index?',
        a: 'It stores the position of the current card.'
      },

      {
        id: uid(),
        q: 'What is state.showingAnswer?',
        a: 'It tells whether the answer is currently displayed.'
      },

      {
        id: uid(),
        q: 'What is state.editingId?',
        a: 'It stores the ID of the card being edited.'
      },

      {
        id: uid(),
        q: 'What does renderCard do?',
        a: 'It displays the current question or answer.'
      },

      {
        id: uid(),
        q: 'What does renderList do?',
        a: 'It displays all the flashcards in the list.'
      },

      {
        id: uid(),
        q: 'How do you flip a card?',
        a: 'Click the card or click Show answer.'
      },

      {
        id: uid(),
        q: 'What happens when the card is clicked?',
        a: 'The question changes to the answer or back to the question.'
      },

      {
        id: uid(),
        q: 'What happens when Next is clicked?',
        a: 'The application moves to the next card.'
      },

      {
        id: uid(),
        q: 'What happens when Previous is clicked?',
        a: 'The application moves to the previous card.'
      },

      {
        id: uid(),
        q: 'Does navigation cycle through the cards?',
        a: 'Yes. It cycles through the available cards.'
      },

      {
        id: uid(),
        q: 'What happens when there are no cards?',
        a: 'A message asks the user to add a card.'
      },

      {
        id: uid(),
        q: 'How is the current card shown?',
        a: 'The progress section shows the current card number and total cards.'
      },

      {
        id: uid(),
        q: 'Can the user select a card from the list?',
        a: 'Yes. The user can click a card in the list.'
      },

      {
        id: uid(),
        q: 'What happens after selecting a card?',
        a: 'It becomes the current card and shows the question.'
      },

      {
        id: uid(),
        q: 'How do you add a new card?',
        a: 'Click Add a card, enter the question and answer, then click Save card.'
      },

      {
        id: uid(),
        q: 'What happens after saving a new card?',
        a: 'The new card is added to the deck.'
      },

      {
        id: uid(),
        q: 'Where is the new card displayed?',
        a: 'It appears in the card list and becomes the current card.'
      },

      {
        id: uid(),
        q: 'Can the answer be empty?',
        a: 'Yes, the current code allows an empty answer.'
      },

      {
        id: uid(),
        q: 'Can an empty card be added?',
        a: 'No. If both fields are empty, the card is not added.'
      },

      {
        id: uid(),
        q: 'What does trim do?',
        a: 'It removes unnecessary spaces from the text.'
      },

      {
        id: uid(),
        q: 'What happens after saving a card?',
        a: 'The card is saved, the form closes, and the display updates.'
      },

      {
        id: uid(),
        q: 'Does the application automatically save cards?',
        a: 'Yes. Cards are automatically saved in the browser.'
      },

      {
        id: uid(),
        q: 'Can a card be edited?',
        a: 'Yes. The Edit button can be used to modify a card.'
      },

      {
        id: uid(),
        q: 'How do you edit a card?',
        a: 'Click Edit, change the question or answer, and save it.'
      },

      {
        id: uid(),
        q: 'What happens when Edit is clicked?',
        a: 'The existing question and answer are loaded into the form.'
      },

      {
        id: uid(),
        q: 'Can a card be deleted?',
        a: 'Yes. The Delete button removes a card.'
      },

      {
        id: uid(),
        q: 'How do you delete a card?',
        a: 'Click the Delete button beside the card.'
      },

      {
        id: uid(),
        q: 'What happens after deleting a card?',
        a: 'The card is removed and the list is updated.'
      },

      {
        id: uid(),
        q: 'What happens if the current card is deleted?',
        a: 'The application adjusts the current card index.'
      },

      {
        id: uid(),
        q: 'Which function handles editing?',
        a: 'The openEdit function handles editing.'
      },

      {
        id: uid(),
        q: 'Which function handles deleting?',
        a: 'The deleteCard function handles deleting.'
      },

      {
        id: uid(),
        q: 'What is localStorage?',
        a: 'It is browser storage used to save data locally.'
      },

      {
        id: uid(),
        q: 'Why is localStorage used?',
        a: 'It keeps the flashcards saved between visits.'
      },

      {
        id: uid(),
        q: 'Does localStorage require a database?',
        a: 'No. It is built into the web browser.'
      },

      {
        id: uid(),
        q: 'What storage key is used?',
        a: 'cardbox_flashcards_v1.'
      },

      {
        id: uid(),
        q: 'What does getItem do?',
        a: 'It retrieves saved data from localStorage.'
      },

      {
        id: uid(),
        q: 'What does setItem do?',
        a: 'It saves data in localStorage.'
      },

      {
        id: uid(),
        q: 'What format is used to store cards?',
        a: 'The cards are stored as JSON text.'
      },

      {
        id: uid(),
        q: 'What is JSON?',
        a: 'JSON is a text format used to represent structured data.'
      },

      {
        id: uid(),
        q: 'What does JSON.stringify do?',
        a: 'It converts JavaScript data into a JSON string.'
      },

      {
        id: uid(),
        q: 'What does JSON.parse do?',
        a: 'It converts a JSON string back into JavaScript data.'
      },

      {
        id: uid(),
        q: 'Why does each card have a unique ID?',
        a: 'It helps identify individual cards for editing and deleting.'
      },

      {
        id: uid(),
        q: 'What function creates a card ID?',
        a: 'The uid function creates a unique card ID.'
      },

      {
        id: uid(),
        q: 'What is an array?',
        a: 'An array stores multiple values in one variable.'
      },

      {
        id: uid(),
        q: 'What is an object?',
        a: 'An object stores related data using properties.'
      },

      {
        id: uid(),
        q: 'What information does each card contain?',
        a: 'Each card contains an ID, question, and answer.'
      },

      {
        id: uid(),
        q: 'Why is clampIndex used?',
        a: 'It keeps the current card index within a valid range.'
      },

      {
        id: uid(),
        q: 'What does renderAll do?',
        a: 'It updates the current card and the card list.'
      },

      {
        id: uid(),
        q: 'What does escapeHtml do?',
        a: 'It safely handles special HTML characters in card text.'
      },

      {
        id: uid(),
        q: 'Why is error handling used with localStorage?',
        a: 'It helps prevent storage problems from breaking the application.'
      },

      {
        id: uid(),
        q: 'What are the main advantages of the project?',
        a: 'It is simple, lightweight, easy to use, and does not require a server.'
      },

      {
        id: uid(),
        q: 'What is one limitation of the project?',
        a: 'Cards are stored only in the browser.'
      },

      {
        id: uid(),
        q: 'Can multiple users share the same cards?',
        a: 'Not in the current version.'
      },

      {
        id: uid(),
        q: 'Does the project have a backend?',
        a: 'No. The current version is frontend-only.'
      },

      {
        id: uid(),
        q: 'Does the project use a database?',
        a: 'No. It uses browser localStorage.'
      },

      {
        id: uid(),
        q: 'What future improvements can be added?',
        a: 'Login, cloud storage, categories, search, quiz mode, and progress tracking.'
      },

      {
        id: uid(),
        q: 'Can the project use a database in the future?',
        a: 'Yes. A backend and database can be added for cloud storage.'
      },

      {
        id: uid(),
        q: 'Can the project be used on mobile devices?',
        a: 'Yes. The design supports responsive layouts.'
      },

      {
        id: uid(),
        q: 'What did you learn from this project?',
        a: 'I learned how HTML, CSS, and JavaScript work together to build a web application.'
      },

      {
        id: uid(),
        q: 'What is the project in one sentence?',
        a: 'It is a flashcard app for creating, studying, editing, deleting, and saving Q&A cards.'
      }

    ];

    save();
  }

  renderAll();

})();