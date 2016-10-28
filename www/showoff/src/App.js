import React, { Component } from 'react';
class App extends Component {
  render() {
    return (
      <div>
        <Navbar schedule={this.props.schedule}/>
        <ShowView schedule={this.props.schedule}/>
      </div>
    );
  }
}


class Navbar extends Component {
  render() {
    return (
      <div className='navbar navbar-default'>
        <div className="container-fluid">
          <div className="navbar-header">
             <a className="navbar-brand" href="#">ShowMaster {this.props.schedule.format}</a>
             
          </div>
        </div>
      </div>
    );
  }
}

class ShowView extends Component {
  render() {
    var active_scene = 1;
    return (
    <div className="container">
      <div className="row">
        <div className="col-md-3 ">
          <div className="list-group schedule-scenes">
            <ProgramView active={active_scene} scenes={this.props.schedule.schedule}/>
            <QuickProgramPicker programs={this.props.schedule.programs}/>
          </div>
        </div>
        <div className="col-md-3">
          <SceneView scene_lookup="next"/>
        </div>
        <div className="col-md-4">
          <SceneView/>
        </div>
        <div className="col-md-2">
          <GlobalControls/>
        </div>
      </div>
    </div>
    )
  }
}

class ProgramSceneView extends Component {
  render() {
    return (
      <a href="#" className={"list-group-item " + this.props.active}>
        <h4 className="list-group-item-heading">{this.props.name}</h4>
        <p className="list-group-item-text">{this.props.desc}</p>
      </a>
    )
  }
}
class ProgramView extends Component {
  render() {
    var scenes = []
    
    for(var key in this.props.scenes) {
      var scene = this.props.scenes[key];
      var active = (this.props.active == key)? "active": "";
      scenes.push(
        <ProgramSceneView active={active} name={scene.name} desc={scene.desc}/>
      )
    }
    return (
      <div>
        {scenes}
      </div>
    );
  }
}


class QuickProgram extends Component {
  render() {
    return (
      <span className="label label-danger">{this.props.name}</span>
    );
  }
}
class QuickProgramPicker extends Component {
  render() {
    var programs = []
    for (var program_name in this.props.programs){
      programs.push(<QuickProgram name={program_name}/>)
    };
    return (
      <div className='quick-programs'>
        <h4>Quick Programs</h4>
        {programs}
      </div>
    );
  }
}


class SceneView extends Component {
  render() {
    var header;
    if (this.props.scene_lookup === "next") {
      header =  (
        <h1>Next scene <GoButton/></h1>
      );
    }else {
      header = (
        <h1>Current Scene</h1>
      );
    }
  
    return (
      <div>
        {header}
      </div>
    );
  }
}

class GlobalControls extends Component {
  render() {
    return (
      <div>
      </div>
    );
  }
}

class GoButton extends Component {
  render() {
    return (
      <span>
          <button id="button-go" type="button" className="btn btn-success" aria-label="Left Align">
            <span aria-hidden="true">GO &gt;&gt; </span>
          </button>
      </span>
    )
  }
}
export default App;

