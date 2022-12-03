const { Component } = React;

class ErrorMessage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      color: 'danger',
      message: '',
      linkText: '',
      linkHref: '#',
    }

    this.clearMessage = () => {
      this.setState({
        color: 'danger',
        message: '',
        linkText: '',
        linkHref: '#',
      });
    }

    this.showError = (message) => {
      this.setState({
        color: 'danger',
        message,
        linkText: '',
        linkHref: '#',
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
