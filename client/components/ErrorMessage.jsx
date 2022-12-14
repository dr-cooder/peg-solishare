const { Component } = React;

class ErrorMessage extends Component {
  constructor(props) {
    super(props);

    const defaultState = {
      color: 'danger',
      message: '',
      linkText: '',
      linkHref: '#',
    }
    this.state = defaultState

    this.clearMessage = () => {
      this.setState(defaultState);
    }

    this.showSpinner = () => {
      this.setState({
        color: 'white',
        message:  <span className="spinner-border" role="status" aria-hidden="true"></span>,
        linkText: '',
        linkHref: '#',
      });
    }

    this.showError = (message, linkText, linkHref) => {
      this.setState({
        color: 'danger',
        message,
        linkText,
        linkHref: linkHref || '#',
      });
    }

    this.showSuccess = (message, linkText, linkHref) => {
      this.setState({
        color: 'success',
        message,
        linkText,
        linkHref: linkHref || '#',
      })
    }
  }

  render() {
    return (
      <div className="errorMessageContainer">
        <h3 className={`text-${this.state.color}`}>{this.state.message}</h3>
        <a href={this.state.linkHref}>{this.state.linkText}</a>
      </div>
    )
  }
}

module.exports = ErrorMessage;
