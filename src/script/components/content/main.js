import React, { Component } from "react";
import ReactDOM from "react-dom";
import TodoStore from "../../stores/TodoStore";
import * as TodoActions from "../../actions/TodoActions";
import SweetAlert from 'sweetalert-react';
import { Button } from 'reactstrap';

export default class Content extends Component {

  constructor() {
    super();
    this.state = {
      lists:TodoStore.getTodos(),
      currentTitle: "",
      currentId: "",
      editing: -1,
      finishEditing: false
    };
  }

  componentWillMount(){
    TodoStore.on("create", this.getStoreData.bind(this));
    TodoStore.on("edit", this.getStoreData.bind(this));
    TodoStore.on("delete", this.getStoreData.bind(this));

  }

  //prevent memory leak results from event binding
  componentWillUnmount(){
    TodoStore.removeListener("create", this.getStoreData.bind(this));
    TodoStore.removeListener("edit", this.getStoreData.bind(this));
    TodoStore.removeListener("delete", this.getStoreData.bind(this));

  }

  getStoreData(){
    this.setState({
      lists: TodoStore.getTodos()
    });
  }

  editHandler(event){
    this.setState({
      currentTitle: event.target.value
    }, () => {
      TodoActions.editTodo(this.state.currentId, this.state.currentTitle);
    });
  }

  startEditing(event){
    this.setState({
      editing: event.target.dataset.id,
      currentId: event.target.dataset.id
    });
  }

  endEditing(event){
    this.setState({
      editing: -1,
      finishEditing: true
    });
  }

  editTodoStatus(event){
    const id = event.target.parentNode.dataset.id;
    TodoActions.editTodoStatus(id);
  }

  deleteTodo(event){
    const id = event.target.parentNode.dataset.id;
    //TodoActions.deleteTodo(id);
    this.props.deleteTodo(id);
  }

  renderList(){
    return this.state.lists.map(
      (todo, key) => {

        if (todo.visible == false){
          return;
        }

        var complete;
        if (todo.complete){
          complete = <Button color="info">✓</Button>;
        }else{
          complete = <Button color="danger" onClick = {this.editTodoStatus.bind(this)} >✗</Button>;
        }

        if (todo.id == this.state.editing){
          return (
            <li className = "editing" key = {todo.id} data-id = {todo.id}>
              {complete}
              <input value = {todo.title} onChange = {this.editHandler.bind(this) }/>
              <button onClick = {this.deleteTodo.bind(this)} >
                DELETE
              </button>
              <button onClick = {this.endEditing.bind(this)} >
                OK
              </button>
            </li>
            );
        }else{
          return (
            <li className = "edited" key = {todo.id} data-id = {todo.id} onClick = {this.startEditing.bind(this)}>
              {complete}
              <br />
              <h3>{todo.title}</h3>
              <br />
              Date: {todo.date}
              <SweetAlert
              show={this.state.editing && this.state.finishEditing}
              title="Confirmed?"
              text= {todo.title}
              onConfirm={() => this.setState({ finishEditing: false })}
            />
            </li>);
        }
      }
    )
  }

  render() {
    return (
        <div className="list_container">
          <ul>
            { this.renderList()}
          </ul>
        </div>
    );
  }
}