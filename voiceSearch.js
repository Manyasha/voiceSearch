(function () {
    'use strict';

    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

    if ( typeof SpeechRecognition === 'undefined' ) {
        return;
    }

    var finalTranscript = '';
    var activeSearchFormInput = null;
    var isRecognitionFailed = false;
    var recognizing = false;
    var recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 4;
    recognition.lang = 'en-US';

    recognition.onstart = function() {
        recognizing = true;
        console.log('start recognition');
    };

    recognition.onend = function() {
        recognizing = false;
        endRecognition();
        console.log('end recognition');
    };

    recognition.onerror = function(event) {
        isRecognitionFailed = true;
        console.log('Speech recognition error: ' + event.error);
    };

    recognition.onspeechstart = function() {
        console.log('Speech has been detected');
    };

    recognition.onspeechend = function() {
        console.log('Speech has stopped being detected');
    };

    recognition.onresult = function(event) {
        activeSearchFormInput.value = getTranscript(event).trim();
    };

    function getTranscript(event) {
        var interimTranscript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        return finalTranscript || interimTranscript;
    }

    function endRecognition() {
        var activeSearchForm = document.querySelector('.voice-search-form-active');
        activeSearchForm.classList.remove('voice-search-form-active');

        if ( isRecognitionFailed || !activeSearchFormInput.value ) {
            return;
        }

        activeSearchForm.submit();
    }

    function startRecognition(event) {
        event.preventDefault();

        if (recognizing) {
            isRecognitionFailed = true;
            recognition.stop();
            return;
        }

        var parentForm = getParentForm(event.target);
        parentForm.classList.add('voice-search-form-active');

        activeSearchFormInput = parentForm.querySelector('input');
        activeSearchFormInput.value = '';

        finalTranscript = '';
        isRecognitionFailed = false;
        recognition.start();
    }

    function getParentForm(elem) {
        var form = null;

        while ( (elem = elem.parentElement) !== null && !form ) {
            if ( elem.nodeType !== Node.ELEMENT_NODE ||
                 elem.nodeName.toLowerCase() !== 'form' ) {
                continue;
            }

            form = elem;
        }

        return form;
    }

    function renderVoiceSearchButton(searchForm) {
        var searchButton = searchForm.querySelector('button');
        var voiceSearchButton = document.createElement('button');

        voiceSearchButton.className = searchButton.getAttribute('class') + ' voice-search-button';
        //voiceSearchButton.dataset.icon = '';
        voiceSearchButton.addEventListener('click', startRecognition);

        searchButton.parentNode.insertBefore(voiceSearchButton, searchButton.nextSibling);
    }

    document.addEventListener('DOMContentLoaded', function () {
        var searchForms = document.querySelectorAll("form[class*=search]");

        for (var i = 0; i < searchForms.length; i++) {
            renderVoiceSearchButton(searchForms[i]);
        }
    });

})();
