
const svgElement = (qualifiedName, attrs) => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', qualifiedName);
    for (let a of Object.keys(attrs)) {
        element.setAttribute(a, attrs[a]);
    }
    return element;
}

class SharedNotepad { 

    constructor(document) {
        this.svg = document.getElementById('textGrid');
        this.svg.setAttribute('width', 850);
        this.svg.setAttribute('height', 900);

        const r = (((Math.random() * 1000) + 120) % 255) - 50;
        const g = (((Math.random() * 1000) + 120) % 255) - 50;
        const b = (((Math.random() * 1000) + 120) % 255) - 50;
        this.cursorColor = `rgba(${r}, ${g}, ${b}, 0.2)`

        this.cellWidth = 11;
        this.cellHeight = 20;

        this.cols = Math.floor(this.svg.getAttribute('width') / this.cellWidth);
        this.rows = Math.floor(this.svg.getAttribute('height') / this.cellHeight);
        this.cursor = { row: 0, col: 0 };
        this.startCol = 0;
        this.textElements = [];

        this.initSocket();
    }

    initSocket() {
        this.socket = new WebSocket(`ws://${window.location.hostname}:9009`);
        this.socket.addEventListener('open', () => {
            console.log('Connected.');
            this.registerEvents(document);
            this.drawGrid();
            this.initCursor();
            this.updateCursor();
        });

        this.socket.addEventListener('message', (event) => {
            const packet = JSON.parse(event.data);
            console.log('event', packet);

            if (packet.t === 'cv') {
                const c = packet.c;
                this.textElements[c.x][c.y].textContent = c.key;
            } else if (packet.t === 'mc') { // MOVE CURSOR (other clients)
                console.log('mc packet', packet);
            }
        });

        this.socket.addEventListener('close', () => {
            console.log('closed.');
            // if (this.textElements.length > 0) {
            //     for (let r of Object.keys(this.textElements)) {
            //         for (let c of Object.keys(this.textElements[r])) {
            //             this.textElements[r][c].textContent = value;
            //         }
            //     }
            // }
        });
    }

    initCursor() {
        this.cursorRect = svgElement('g', {
            transform: `translate(0, 0)`
        });

        const bottomLine = svgElement('rect', {
            'x': 0,
            'y': this.cellHeight - 1,
            'width': this.cellWidth,
            'height': 2,
            'fill': 'rgba(0,0,0,0.4)'
        });

        const r = svgElement('rect', {
            'width': this.cellWidth,
            'height': this.cellHeight,
            'fill': this.cursorColor,
        });

        this.cursorRect.appendChild(r);
        this.cursorRect.appendChild(bottomLine);

        this.svg.appendChild(this.cursorRect);
    }

    initCell(c, r) {
        const rect = svgElement('rect', {
            'x': c * this.cellWidth,
            'y': r * this.cellHeight,
            'width': this.cellWidth,
            'height': this.cellHeight,
            'fill': 'white'
        });

        rect.addEventListener('click', () => {
            this.startCol = c;
            this.cursor.row = r;
            this.cursor.col = c;
            this.updateCursor();
        });
        this.svg.appendChild(rect);
    }

    drawHLine(r) {
        const line = svgElement('line', {
            'x1': 0,
            'y1': r * this.cellHeight,
            'x2': this.svg.getAttribute('width'),
            'y2': r * this.cellHeight,
            'stroke': 'rgba(0,0,255,0.2)',
            'stroke-width': 1,
        });
        this.svg.appendChild(line);
    }

    updateCursor() {
        console.log('updateCursor');
        const x = this.cursor.col * this.cellWidth;
        const y = this.cursor.row * this.cellHeight;
        this.cursorRect.setAttribute('transform', `translate(${x}, ${y})`)

        this.socket.send(JSON.stringify({ t: 'mc', c: { x, y } }))
    }

    setCell(x, y, key) {
        this.textElements[x][y].textContent = key;
        this.socket.send(JSON.stringify({ t: 'cv', c: { x, y, key } }));
    }

    drawGrid() {
        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                this.initCell(c, r);
                const text = svgElement('text', {
                    'x': c * this.cellWidth,
                    'y': r * this.cellHeight + this.cellHeight - 2,
                    'font-size': 18,
                    'font-family': '"Mynerve", cursive',
                    'fill': 'black',
                    //'color': 'black'
                });
                this.svg.appendChild(text);
                row.push(text);
            }
            if (r > 5) {
                this.drawHLine(r);
            }
            this.textElements.push(row);
        }

        const line = svgElement('line', {
            'x1': 10 * this.cellWidth,
            'y1': 0,
            'x2': 10 * this.cellWidth,
            'y2': this.svg.getAttribute('height'),
            'stroke': 'rgba(255,0,255,0.2)',
            'stroke-width': 2,
        });
        this.svg.appendChild(line);
    }

    onBackspace() {
        // Move cursor left and clear the character
        if (this.cursor.col > 0) {
            this.cursor.col--;
        } else if (this.cursor.row > 0) {
            this.cursor.row--;
            this.cursor.col = this.cols - 1;
        }
        this.setCell(this.cursor.row, this.cursor.col, '');
    }

    onEnter() {
        if (this.cursor.row < this.rows) {
            this.cursor.row++;
        }
        this.cursor.col = this.startCol;
    }

    onDelete() {
        this.setCell(this.cursor.row, this.cursor.col, '');
    }

    onMove(key) {
        if (e.key === 'ArrowRight') {
            this.cursor.col = (this.cursor.col + 1) % this.cols;
            if (this.cursor.col === 0) this.cursor.row = (this.cursor.row + 1) % this.rows;
        } else if (e.key === 'ArrowLeft') {
            if (this.cursor.col > 0) {
                this.cursor.col--;
            } else if (this.cursor.row > 0) {
                this.cursor.row--;
                this.cursor.col = cols - 1;
            }
        } else if (e.key === 'ArrowDown') {
            this.cursor.row = (this.cursor.row + 1) % this.rows;
        } else if (e.key === 'ArrowUp') {
            if (this.cursor.row > 0) this.cursor.row--;
        }
    }

    registerEvents(document) {
        document.addEventListener('keydown', (e) => {
            if (e.key.length === 1) {
                // Add the character to the grid
                this.setCell(this.cursor.row, this.cursor.col, e.key);
                this.cursor.col = (this.cursor.col + 1) % this.cols; // Move cursor to the right
                if (this.cursor.col === 0) this.cursor.row = (this.cursor.row + 1) % this.rows;
            } else if (e.key === 'Backspace') {
                this.onBackspace();
            } else if (e.key === 'Enter') {
                this.onEnter();
            } else if (e.key === 'Delete') {
                this.onDelete();
            } else if (e.key.indexOf('Arrow') === 0) {
                this.onMove(e.key);
            }
            this.updateCursor();
        });
    }
}
