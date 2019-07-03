// ;(function () {
'use strict';

	const gameNode = document.querySelector(".game-field");
	const gamePopup = document.querySelector(".popup");
	
	let cards;
	
	let timerNode = document.querySelector(".timer"),
		aa = timerNode.textContent.split(':'),
		gameDuration = Number(aa[0]) * 60 + Number(aa[1]);

	let timer = {
			id: null,
			_seconds: 0,	

			set seconds(v) {
				this._seconds = v;
				
				let m = Math.floor(v/60),
					s = v - m*60,
					str = ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
				
				timerNode.textContent = str;
				},
			get seconds() {
				return this._seconds;
			}
		};


	function startGame() {
		cards = Array.from(gameNode.querySelectorAll(".card")).map( elem => new Card(elem) );
		// console.log("cards", cards);
		
		// В начале игры все карты закрыты
		cards.forEach(item => {item.isOpen(false);});
		
		timer.seconds = gameDuration;

		shuffle(gameNode);
	};
	
	function winGame(win) {
		const n = document.body.querySelector(".popup");
		n.querySelector(".popup__animation_win").classList.add("hidden");
		n.querySelector(".popup__animation_lose").classList.add("hidden");

		if (win) {
			n.querySelector(".popup__animation_win").classList.remove("hidden");
		} else {
			n.querySelector(".popup__animation_lose").classList.remove("hidden");
		}
		
		n.classList.remove('hidden');
		
		stopTimer();
	}

	function cardFindByNode (cards, node) {
		let i = 0, len = cards.length, foundCard = null;

		while (foundCard === null && i<len) {
			if (node === cards[i].node) {
				foundCard = cards[i];
			} ;
			i++;
		}

		return foundCard;
	}
	
	
	function Card (node) {
		const o = {
			value: node.querySelector(".card__side_face").dataset.emodji,
			node: node,
			_matchStatus: null,
			_isOpen: node.querySelector(".card__checkbox").checked
		};
		
		if (o._isOpen && node.querySelector(".card__side_mismatch") !== null) {
			o._matchStatus = "mismatch";
		};
		
		if (o._isOpen) node.querySelector(".card__checkbox").disabled = true;
			
		Object.assign(this, o);
		
		return this;
	};
	
	Card.prototype.isOpen = function ( v ) {
		if (v === undefined) {
			return this._isOpen;
		};
		
		this._isOpen = v;

		// Если карта закрыта, ставим ей статус совпадения "Неприменимо";
		if (!v) {
			this.matchStatus(null);
		}
		
		const n = this.node.querySelector(".card__checkbox");
		n.checked = this._isOpen;
		n.disabled = this._isOpen; // карту нельзя закрыть по каманде пользователя
	};
	
	Card.prototype.matchStatus = function ( v ) {
		if (v === undefined) {
			return this._matchStatus;
		};
		
		this._matchStatus = v;
		
		const n = this.node.querySelector(".card__side_face");
		n.classList.remove("card__side_match", "card__side_mismatch");
		if (this.matchStatus() === "match") {
			n.classList.add("card__side_match");
		} else if (this.matchStatus() === "mismatch") {
			n.classList.add("card__side_mismatch");
		}
	}
	
	function openCard (card) {
		// Закрыть открытые ранее карты со статусом "Несовпадающие"
		cards.forEach(item => {
			// console.log(item, item.isOpen(), item.matchStatus(), item !== card); 
			if (item.isOpen() && item.matchStatus() === "mismatch" && item !== card) {
				item.isOpen(false);
			}
		});
		// console.log(card, cards);
		
		card.isOpen(true);
		
		// Найти среди открытых еще карты с таким же рисунком
		const cc = cards.filter(elem => elem.isOpen() && elem.value === card.value );
		if (cc.length > 1) {
			// если нашли, поставить статус "Совпадающие" текущей и найденным
			cc.forEach(item => {
				item.matchStatus("match");
			})
		} else {
			// иначе поставить статуc "Несовпадающие" всем открытым, если их больше одной
			
			const сс = cards.filter(elem => elem.isOpen() && elem.matchStatus() !== "match");
			if (сс.length>1) {
				сс.forEach(item => {item.matchStatus("mismatch");})
			}
		}
		
		// Если нет закрытых карт, то победили
		if (!cards.some(el => !el.isOpen())) {
			winGame(true);
		}
	}
	
	// Тусуем карты
	function shuffle (node) {
		const nn = Array.from(node.children);
		
		nn.forEach(item => {
			item.remove();
		});
		
		nn.sort(()=> (Math.random()-0.5));

		nn.forEach(item => {
			node.appendChild(item);
		});
	}
	
	function startTimer() {
		// Если таймер активен или время вышло, то ничего не делать
		if (timer.seconds <= 0 || timer.id !== null) return;
		
		// console.log("timer start");
		timer.id = setInterval(	function () {
			// console.log("таймер тик");
			timer.seconds--;
			

			// Если время игры истекло
			if (timer.seconds <= 0) {
				winGame(false);
				stopTimer();
			}
		}, 1000);
	};
	
	function stopTimer() {
		clearInterval(timer.id);
		timer.id = null;
		
		// console.log("timer stop. timerId", timer.id);
	}
	
	// Обработка переворота карточки
	gameNode.addEventListener("change", e => {
		console.assert(e.target.classList.contains("card__checkbox"));
		const cardIsOpen = e.target.checked;

		const cardNode = e.target.closest(".card");
		console.assert(cardNode !== null);
		// console.log("cardNode", cardNode); 
		
		const card = cardFindByNode(cards, cardNode);
		console.assert(card !== null);
		
		
		if (!card.isOpen()) {
			startTimer();
			openCard(card);
		} else {
			// Переворачивать открытую карту нельзя
			e.target.checked = true; // e.preventDefault() не работает для change
			throw Error ("Переворачивать открытую карту нельзя");
		}
	});
	
	gamePopup.querySelector(".popup__btn").addEventListener("click", (e) => {
		e.target.closest(".popup").classList.add('hidden');
		startGame();
	})
	
	// gameNode.addEventListener("transitionend", (e) => {
	// 	console.log("transition end");
	// })

	
	startGame();
	
// })();