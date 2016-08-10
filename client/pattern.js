(function(Lava) {

    var event = (function() {
        function CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent('gameOver');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }

        CustomEvent.prototype = window.Event.prototype;

        window.CustomEvent = CustomEvent;
    })();
    //var event = new Event('gameOver');

    function Game(container_ids, input, size) {

        this.elem = container_ids
        this.input = input;
        this.size = size;
        this.boardElem = $('#' + this.elem.board_id);
        this.board = new Lava(this.input, this.size);
        this.current_swap = 0;
        //console.log(this.board);
        this.init();

        this.gameOverModel = {
            new_game: 'modal-new-game',
            reset_game: 'modal-reset-game'

        }

        this.isAuto = false;

        //console.log(this.board.current_empty);
        this.autoPlay();
        //this.gameOver();
    }



    Game.keycodes = {
        LEFT: {
            '37': 1
        },
        UP: {
            '38': 1
        },
        RIGHT: {
            '39': 1
        },
        DOWN: {
            '40': 1
        }
    }

    Game.events = {
        KEYDOWN: 'keydown',
        KEYUP: 'keyup',
        RESIZE: 'resize',
        LOAD: 'load'
    };
    Game.prototype.init = function() {
        this.drawBoard();
        this.insertGameOverModel();
        this.startListening();
        this.setBestSwap();
    };
    Game.prototype.setBestSwap = function() {
        $('#' + this.elem.best_swaps).text(this.board.minimum_swap);
    }
    Game.prototype.drawBoard = function() {

        /* var size = this.board.size;
         var box_size = this.getBoxSize();

         var grid_size = box_size * size;
         //console.log(box_size);
         this.boardElem.empty();
         for (var i = 0; i < size; i++) {
             var str = '<div class="row remove-margin remove-bottom-margin">'

             for (var j = 0; j < size; j++) {
                 var data = this.board.out.get(i, j);
                 str += '<div class="col center-align cell " id="cell-' + i.toString() + '-' + j.toString() + '" style="background:' + data.c + ';width:' + box_size + 'px;height:' + box_size + 'px;line-height: ' + box_size + 'px;">';
                 // str += '<span class="center-align">' + this.board.out.get(i, j).d + '</span>'
                 str += data.d;
                 str += '</div>'
             }
             str += '</div>';

             this.boardElem.append(str);
         }
         this.boardElem.css('width', grid_size);
         this.boardElem.css('height', grid_size);*/
        var box_size = this.getBoxSize();
        this.addHtml(this.boardElem, this.board.out, box_size);
        $('#' + this.elem.current_swaps).text(this.current_swap);

    };

    Game.prototype.addHtml = function(elem, matrix, box_size) {

        var size = this.board.size;
        var grid_size = box_size * size;
        //console.log(box_size);
        elem.empty();
        for (var i = 0; i < size; i++) {
            var str = '<div class="row remove-margin remove-bottom-margin">'

            for (var j = 0; j < size; j++) {
                var data = matrix.get(i, j);
                str += '<div class="col center-align cell " id="cell-' + i.toString() + '-' + j.toString() + '" style="background:' + data.c + ';width:' + box_size + 'px;height:' + box_size + 'px;line-height: ' + box_size + 'px;">';
                // str += '<span class="center-align">' + this.board.out.get(i, j).d + '</span>'
                str += data.d;
                str += '</div>'
            }
            str += '</div>';

            elem.append(str);
        }
        elem.css('width', grid_size + 2);
        elem.css('height', grid_size + 2);
    }
    Game.gameOverModel = {
        id: "game-over-model",
        html: '<!-- Modal Structure -->\
                <div id="game-over-model" class="modal">\
                    <div class = "modal-content" >\
                        <h4> Game Over </h4>\
                        <p> Congrats!!!!!!!! </p>\
                        <div class="my-rating" id="my-rating"></div>\
                    </div>\
                    <div class = "modal-footer" >\
                        <button id="modal-new-game" class = " modal-action modal-close waves-effect waves-green btn-flat btn" ><i class="material-icons left">restore</i> New Game </button>\
                        <button id="modal-reset-game" class = " modal-action modal-close waves-effect waves-green btn-flat btn" ><i class="material-icons left">repeat</i> Replay </button>\
                    </div>\
                </div>'
    };
    Game.prototype.insertGameOverModel = function() {
        $('body').append(Game.gameOverModel.html);
        $("#my-rating").starRating({
            readOnly: true,
            starSize: 30
        });
    };

    Game.prototype.handleEvent = function(e) {
        return (function(evtType, events) {
            switch (evtType) {
                case events.KEYDOWN:
                    this.onKeyDown(e);
                    break;
                case events.RESIZE:
                    this.drawBoard();
                    break;
            }
        }.bind(this))(e.type, Game.events);
    };
    Game.prototype.startListening = function() {
        // Keys.
        document.addEventListener(Game.events.KEYDOWN, this);
        //document.addEventListener(Game.events.KEYUP, this);
        window.addEventListener(Game.events.RESIZE, this);

        $(document).on('gameOver', $.proxy(this.gameOver, this));
        //document.addEventListener('gameOver', (function(this){function (e) { console.log('hr')}})(this), false);
        // Dispatch the event.
        //document.dispatchEvent(event);
        //
        var that = this;
        $(function() {


            //Enable swiping...
            //that.elem.boardElem
            $("#" + that.elem.game_container).swipe({
                //Generic swipe handler for all directions
                swipe: function(event, direction, distance, duration, fingerCount, fingerData) {
                    //$(this).text("You swiped " + direction);
                    event.preventDefault();

                    switch (direction) {
                        case 'up':
                            that.moveUp();
                            break;
                        case 'down':
                            that.moveDown();
                            break;
                        case 'left':
                            that.moveLeft();
                            break;
                        case 'right':
                            that.moveRight();
                            break;
                    }
                },
                //Default is 75px, set to 0 for demo so any distance triggers swipe
                threshold: 0
            });
        });



    };

    Game.prototype.onKeyDown = function(e) {
        e.preventDefault();
        var pos = this.board.current_empty;
        var x = pos.x;
        var y = pos.y;
        if (Game.keycodes.LEFT[e.keyCode]) {

            this.moveLeft();

        }

        if (Game.keycodes.UP[e.keyCode]) {
            this.moveUp();

        }

        if (Game.keycodes.RIGHT[e.keyCode]) {
            this.moveRight();

        }

        if (Game.keycodes.DOWN[e.keyCode]) {
            this.moveDown();
        }

    };

    Game.prototype.moveLeft = function() {
        var pos = this.board.current_empty;
        var x = pos.x;
        var y = pos.y;
        if (this.board.move["Right"]()) {
            this.current_swap++;
            //this.board.display(this.board.out);
            this.isGameOver();
            this.updateUI(x, y);
        }
    }

    Game.prototype.moveUp = function() {
        var pos = this.board.current_empty;
        var x = pos.x;
        var y = pos.y;
        if (this.board.move["Down"]()) {
            this.current_swap++;
            this.isGameOver();

            //this.board.display(this.board.out);
            this.updateUI(x, y);
        }
    }
    Game.prototype.moveRight = function() {
        var pos = this.board.current_empty;
        var x = pos.x;
        var y = pos.y;
        if (this.board.move["Left"]()) {
            this.current_swap++;
            this.isGameOver();

            //this.board.display(this.board.out);
            this.updateUI(x, y);
        }
    }
    Game.prototype.moveDown = function() {
        var pos = this.board.current_empty;
        var x = pos.x;
        var y = pos.y;
        if (this.board.move["Up"]()) {
            this.current_swap++;
            this.isGameOver();

            //this.board.display(this.board.out);
            this.updateUI(x, y);
        }
    }
    Game.prototype.updateUI = function(x, y) {
        var data_cell_id = '#cell-' + x.toString() + '-' + y.toString();
        var data_elem = $(data_cell_id);

        var data = this.board.out.get(x, y);
        data_elem.text(data.d);
        data_elem.css('background', data.c);

        var current_empty = this.board.current_empty;

        var empty_id = '#cell-' + current_empty.x.toString() + '-' + current_empty.y.toString();
        var empty_elem = $(empty_id);
        var empty_data = this.board.out.get(current_empty.x, current_empty.y);
        empty_elem.text(empty_data.d);
        empty_elem.css('background', '#FFFFFF');

        $('#' + this.elem.current_swaps).text(this.current_swap);

    };
    Game.prototype.getBoxSize = function() {
        var window_height = window.innerHeight;
        var gameWidth = document.getElementById(this.elem.game_container).offsetWidth;
        // console.log(gameWidth);
        // console.log(window_height);
        if (gameWidth < window_height) {
            return Math.floor((Math.floor(gameWidth - 10)) / this.board.size);
        } else {
            return Math.floor((Math.floor(window_height) - 20) / this.board.size);
        }
    }

    Game.prototype.autoPlay = function() {

        return;
        this.isAuto = true;
        var that = this;
        //
        function move() {
            var pos = that.board.current_empty;
            var x = pos.x;
            var y = pos.y;
            var move = that.board.moveHistory.pop();

            //that.board.display(that.board.out);
            that.board.move[move.opp]();
            //that.board.display(that.board.out);
            that.current_swap++;
            that.updateUI(x, y);
            that.isGameOver();
            play();
        }

        //move();
        function play() {
            if (that.board.moveHistory.length > 0 && that.isAuto) {
                setTimeout(move, 1000);
            }
        }

        play();
    }

    Game.prototype.gameOver = function() {

        /* */

        $("#my-rating").starRating('setRating', this.getPoint());
        $('#' + Game.gameOverModel.id).openModal({
            dismissible: false
        });
    }

    Game.prototype.getPoint = function() {

        var scale = this.current_swap / this.board.minimum_swap;

        var point = 6 - scale;

        if (point < 0)
            return 1;

        if (point > 4.5 && point < 5)
            return 4.5;

        if (point > 5)
            return 5;

        return point;
    }


    Game.prototype.reSuffle = function() {

        this.isAuto = false;
        this.board.reSuffle();
        this.current_swap = 0;
        this.drawBoard();
        this.setBestSwap();
        var that = this;
        setTimeout(function() {
            that.autoPlay();
        }, 1000);


        //console.log(this.board);

        console.log('reSuffle');
    };
    Game.prototype.reset = function() {
        this.isAuto = false;
        this.board.reset();
        this.current_swap = 0;
        this.drawBoard();
        var that = this;
        setTimeout(function() {
            that.autoPlay();
        }, 1000);
        console.log('reset');
    };

    Game.prototype.setInput = function(input) {
        this.input = input;
        this.board.setInput(input);
    }

    Game.prototype.gridChange = function(input, size) {
        this.input = input;
        this.size = size;
        this.board = new Lava(this.input, this.size);
        this.drawBoard();
        this.setBestSwap();
    }
    Game.prototype.isGameOver = function() {

        if (this.board.isGameOver())
            document.dispatchEvent(event);
    };

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
        module.exports = Game;
    else
        window.Game = Game;

})(Lava);
