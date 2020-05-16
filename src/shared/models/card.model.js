export default class Card {
    constructor(type) {
        this.type = type
        this.props = {}
    }

    setProps(props) {
        this.props = props
    }
}