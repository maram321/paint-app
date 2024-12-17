import React, { Component } from 'react';
import Compact from '@uiw/react-color-compact';

class DrawingApp extends Component {
  state = { 
    isDrawing : false,
    shape : "pen",
    hex : "#000",
    lineWidth : 5,
    fillshape : false,
    startPoint : { x: 0, y: 0 },
    endPoint : { x: 0, y: 0 },
    snapShot : null,
    scale : 1,
    scaleOffset : { x: 0, y: 0 },
    isDraggable : false,
    undoArray : [],
    redoArray :[],
    historyStep : -1
  } 

  handleStartDrawing = (e) => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    this.setState({isDrawing : true});
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineWidth = this.state.lineWidth;
    ctx.strokeStyle = this.state.hex;
    ctx.fillStyle = this.state.hex;
    this.setState({startPoint : { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }});
    this.state.snapShot = ctx.getImageData(0, 0, window.innerWidth, window.innerHeight);
    if (this.state.shape === "hand") {this.setState({isDraggable: true});}
  };

  handleDrawing = (e) => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    this.setState({endPoint :{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }});
    if (!this.state.isDrawing) return;
    ctx.putImageData(this.state.snapShot, 0, 0);
    if (this.state.shape === "pen") {
      ctx.lineTo(this.state.endPoint.x, this.state.endPoint.y);
      ctx.stroke();
      this.setState({startPoint : { x: this.state.endPoint.x, y:this.state.endPoint.y}});

    }

    if (this.state.shape === "line") {
      ctx.beginPath();
      ctx.moveTo(this.state.startPoint.x, this.state.startPoint.y);
      ctx.lineTo(this.state.endPoint.x, this.state.endPoint.y);
      ctx.stroke(); 
 
    }

    if (this.state.shape === "rectangle"){
      const {x:x1, y:y1} = this.state.startPoint;
      const {x:x2, y:y2} = this.state.endPoint;
      if (!this.state.fillshape) {ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)};
      if (this.state.fillshape) {ctx.fillRect(x1, y1, x2 - x1, y2 - y1)};
  
    }

    if (this.state.shape === "circle") {
      const {x:x1, y:y1} = this.state.startPoint;
      const {x:x2} = this.state.endPoint;  
      ctx.beginPath();
      ctx.arc(x1, y1, Math.abs(x2 - x1), 0, Math.PI * 2);
      (!this.state.fillshape)? ctx.stroke() : ctx.fill();
    
    }

    if (this.state.shape === "triangle") {
      ctx.beginPath();
      ctx.moveTo(this.state.startPoint.x, this.state.startPoint.y);
      ctx.lineTo(this.state.endPoint.x, this.state.endPoint.y);
      ctx.lineTo(this.state.startPoint.x * 2 - this.state.endPoint.x, this.state.endPoint.y);
      ctx.closePath();
      (!this.state.fillshape)? ctx.stroke() : ctx.fill();
    
    }

    if (this.state.shape === "hand" && this.state.scale !==1) {
      if (!this.state.isDraggable) return;
      const deltaX = e.nativeEvent.offsetX - this.state.startPoint.x;
      const deltaY = e.nativeEvent.offsetY - this.state.startPoint.y;
      this.setState({scaleOffset :{ x: this.state.scaleOffset.x + deltaX, y: this.state.scaleOffset.y + deltaY }});
    }
  };
  
  handleStopDrawing = (e) => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    this.setState({isDrawing : false});
    ctx.closePath();
    if (this.state.shape === "hand") {this.setState({isDraggable: false});}
    this.state.undoArray.push(ctx.getImageData(0, 0, window.innerWidth, window.innerHeight));
    this.setState({historyStep: this.state.historyStep +1});
  };

  handleMouseLeave = () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    this.setState({isDrawing : false});
    ctx.closePath();
  };
  
  handleShapeChange = (newShape) => {
    this.setState({shape : newShape});
    this.setState({lineWidth : 5});
    this.setState({hex : "#000000"})
  };
  
  handleEraser = () => {
    this.setState({shape : "pen"});
    this.setState({lineWidth : 10});
    this.setState({hex :"#FFFFFF"});
  };

  handleZoom = (ratio) => {
    this.setState({scale : this.state.scale + ratio});
  };

  handleUndo = () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    if (this.state.historyStep <= 0) {this.handleClear();}
    if (this.state.historyStep > 0) {
    this.setState({historyStep: this.state.historyStep -1});
    this.state.redoArray.push(this.state.undoArray.pop());
    ctx.putImageData(this.state.undoArray[this.state.undoArray.length-1],0,0);
    }
  }

  handleRedo = () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    if(this.state.redoArray.length === 0) return;
    this.setState({historyStep: this.state.historyStep +1});
    this.state.undoArray.push(this.state.redoArray.pop())
    ctx.putImageData(this.state.undoArray[this.state.undoArray.length-1],0,0);
  }


  handleClear = () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.setState({scale : 1});
    this.setState({lineWidth : 5});
    this.setState({hex : "#000000"});
    this.setState({scaleOffset : {x:0, y:0}});
    this.setState({undoArray : []});
    this.setState({redoArray : []});
    this.setState({historyStep : -1});
  };

  handleFillShapeChange = () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = this.state.hex;
    ctx.lineWidth = this.state.lineWidth;
    if (!this.state.fillshape) {this.setState({fillshape : true});}
    if (this.state.fillshape) {this.setState({fillshape : false});}
  };

  handleDefaultScale = () => {
    this.setState({scale : 1});
    this.setState({scaleOffset : {x:0, y:0}});
  };
  
  render() { 
      return (
        <div>
          <div className="offcanvas offcanvas-end show" style={{cursor:"pointer"}} tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasNavbarLabel">Lets Draw! <i className="fa-solid fa-palette"></i></h5>
            </div>
            <div className="offcanvas-body">
              <div className="container-fluid">
                <h7>Color</h7>
                <Compact className='mb-2'
                  color={this.state.hex}
                  style={{boxShadow: 'rgb(0 0 0 / 15%) 0px 0px 0px 1px, rgb(0 0 0 / 15%) 0px 8px 16px',}}
                  onChange={(color) => {this.setState({hex : color.hex});}}
                />
                <h7 className='m-3' >Font Size</h7>
                <input
                  type="number"
                  value={this.state.lineWidth}
                  onChange={(e) => this.setState({lineWidth : e.target.value})}
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <h7>Pen</h7>
                <div>
                  <button className='btn btn-warning m-2' onClick={() => this.handleShapeChange("pen")}><i className="fa-solid fa-pen-nib"></i></button>
                </div>
              </div>
              <div>
                <h7>Shapes</h7>
                <div>
                  <button className='btn btn-success m-2' onClick={() => this.handleShapeChange("line")}><i className="fa-duotone fa-solid fa-lines-leaning"></i></button>
                  <button className='btn btn-success m-2' onClick={() => this.handleShapeChange("rectangle")}><i className="fa-regular fa-square"></i></button>
                  <button className='btn btn-success m-2' onClick={() => this.handleShapeChange("circle")}><i className="fa-regular fa-circle"></i></button>
                  <button className='btn btn-success m-2' onClick={() => this.handleShapeChange("triangle")}><i className="fas fa-caret-up"></i></button>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input mb-0" type="checkbox" id="flexSwitchCheckDefault" value="" onChange={this.handleFillShapeChange}/>
                  <label className="form-check-label" type="text" for="flexSwitchCheckDefault">Fill Shape</label>
                </div>
              </div>
              <div>
                <h7>Tools</h7>
                <div>
                  <ul className='list-group list-group-horizontal'>
                  <button className='btn btn-info m-1' onClick={this.handleEraser}><i className="fas fa-eraser"></i></button>
                  <button className='btn btn-info m-1' onClick={this.handleUndo} disabled={this.state.undoArray.length === 0 ? "disabled" : ""}><i className="fa-solid fa-rotate-left"></i></button>
                  <button className='btn btn-info m-1' onClick={this.handleRedo} disabled={this.state.redoArray.length === 0 ? "disabled" : ""}><i className="fa-solid fa-rotate-right"></i></button>
                  <button className='btn btn-info m-1' onClick={() => this.handleShapeChange("hand")}><i class="fa-regular fa-hand"></i></button>
                  <button className='btn btn-info m-1' onClick={() => this.handleZoom(-0.1)} disabled={this.state.scale === 1 ? "disabled" : ""}><i className="fa-solid fa-magnifying-glass-minus"></i></button>
                  <span className='m-1' onClick={this.handleDefaultScale}>{new Intl.NumberFormat('default', {style: 'percent'}).format(this.state.scale)}</span>
                  <button className='btn btn-info m-1' onClick={() => this.handleZoom(0.1)}><i className="fa-solid fa-magnifying-glass-plus"></i></button>
                  </ul>
                </div>
              </div>
              <div>
                <h7>Clear</h7>
                <div>
                  <button className='btn btn-danger m-2' onClick={this.handleClear}>Clear</button>
                </div>
              </div>
            </div>
          </div>
          <canvas
            id="canvas"
            onMouseDown={this.handleStartDrawing}
            onMouseMove={this.handleDrawing}
            onMouseUp={this.handleStopDrawing}
            onMouseLeave={this.handleMouseLeave}
            width={window.innerWidth}
            height={window.innerHeight}
            style={{ 
              cursor:"crosshair",
              transform : `scale(${this.state.scale}) translate(${this.state.scaleOffset.x}px, ${this.state.scaleOffset.y}px)`,
              transformOrigin:"center",
              position : 'absolute'
            }}
          />
        </div>
      ); 
    }
}

export default DrawingApp;