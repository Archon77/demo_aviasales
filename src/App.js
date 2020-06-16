import React, { Component } from 'react';
import logo from './assets/logo.svg';
import './styles/components/app.scss';

import Ticket from './components/Ticket';
import Filter from './components/Filter';

export default class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            tickets: [],
            stops: [],
            filteredBy: [-1],
            errorText: '',
            activeBtn: null, /* DOM node */
            cheapest: null,
            fastest: null
        };

        this.baseTickets = [];
        this.attempts = 0;

        this.sortTickets = this.sortTickets.bind(this);
        this.filterTickets = this.filterTickets.bind(this);
        this.handleSortChange = this.handleSortChange.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
    }

    async componentDidMount() {
        const id = await fetch('https://front-test.beta.aviasales.ru/search')
            .then(data => data.json())
            .then(data => data.searchId)
            .catch(e => console.error(new Error(e)));

        await this.connectToDb(id);
    }

    async connectToDb(id) {
        try {
             await fetch(`https://front-test.beta.aviasales.ru/tickets?searchId=${id}`)
                .then(data => data.json())
                .then(data => {
                    const baseTickets = data.tickets.map((item, index) => {
                        item['id'] = index;
                        return item;
                    });

                    const stops = [-1]; /* 'Все пересадки' */
                    baseTickets.forEach(ticket => {
                        ticket.segments.forEach(segment => {
                            if(!stops.includes(segment.stops.length))
                                stops.push(segment.stops.length)
                        })
                    });

                    /* console.timeEnd: 0.662109375ms
                    let stops = data.tickets.reduce((arr, ticket) => {
                        const stops = ticket.segments.map(segment => segment.stops.length);
                        return [...arr,...stops];
                    }, []);
                    stops = Array.from(new Set(stops))
                    console.timeEnd: 1.3681640625ms, 3.985107421875ms, 8.004150390625ms */

                    this.baseTickets = baseTickets;

                    this.setState({ tickets: baseTickets, stops, isLoading: false }, this.findOptimal)
                })

        } catch (e) {
            console.error(e);

            if(this.attempts++ < 3)
                await this.connectToDb(id);
            else
                this.setState({ errorText: 'что-то пошло не так :(', isLoading: false });
        }
    }

    handleFilterChange(e) {
        const checkbox = e.target;
        const val = +checkbox.name;
        let filteredBy = this.state.filteredBy;

        if(checkbox.checked) {

            if(val === -1) {
                filteredBy = [-1];
            } else {
                filteredBy = filteredBy.filter(item => item !== -1);
                filteredBy.push(val);
            }

        } else {
            filteredBy = filteredBy.filter(item => item !== val);

            if(filteredBy.length === 0)
                filteredBy.push(-1);
        }

        this.setState({ filteredBy }, this.filterTickets);
    }

    filterTickets() {
        let tickets = JSON.parse(JSON.stringify(this.baseTickets));
        const stops = this.state.filteredBy;

        if(stops[0] !== -1)
            tickets = tickets.filter(ticket => {
                ticket.segments = ticket.segments.filter(segment => stops.includes(segment.stops.length));
                return ticket.segments.length;
            });

        this.setState({ tickets }, this.sortTickets);
    }

    handleSortChange(e) {
        const btn = e.target;
        let activeBtn =  this.state.activeBtn;

        if(activeBtn)
            activeBtn.classList.remove('active');

        if(activeBtn === btn) {
            activeBtn = null;
        } else {
            btn.classList.add('active');
            activeBtn = btn;
        }

        this.setState({ activeBtn }, this.sortTickets);
    }

    sortTickets() {
        let tickets = this.state.tickets;
        const activeBtn = this.state.activeBtn;

        if(activeBtn)
            switch (activeBtn.dataset.sort) {
                case 'cheapest':
                    tickets = tickets.sort((a,b) => a.price - b.price);
                    break;
                default:
                    tickets = tickets.map(ticket => {
                        ticket.segments = ticket.segments.sort((a,b) => a.duration - b.duration);
                        return ticket
                    }).sort((a,b) => a.segments[0].duration - b.segments[0].duration);
                    break;
            }
        else
            tickets = tickets.sort((a,b) => a.id - b.id);

        this.setState({ tickets }, this.findOptimal);
    }

    findOptimal() {
        this.findCheapest();
        this.findFastest();
    }

    findCheapest() {
        let cheapest = this.state.tickets.reduce((cheapest, item) => {
            return item.price < cheapest ? item.price : cheapest;
        }, this.state.tickets[0].price);

        this.setState({ cheapest });
    }

    findFastest() {
        let fastest = {
            item: this.state.tickets[0],
            duration: this.state.tickets[0].segments[0].duration,
        };

        this.state.tickets.forEach(item => {

            item.segments.forEach(segment => {
                const duration = segment.duration;

                if(duration < fastest.duration)
                    fastest = { item, duration }
            })
        });

        this.setState({ fastest: fastest.item.price });
    }



    render() {
        return (
            <div className="container">
                { this.state.isLoading ?
                    <div className="app-loader"><span></span><span></span><span></span><span></span></div>
                    :
                    <div className="app">
                        <img src={logo}
                             className="app__logo"
                             alt="logo" />
                        <div className="app__inner">

                            <Filter stops={this.state.stops}
                                    filteredBy={this.state.filteredBy}
                                    handleChange={this.handleFilterChange}/>

                            <div className="app__main">
                                <div className="app__sort">
                                    <button type="button"
                                            data-sort="cheapest"
                                            onClick={this.handleSortChange}>Самый дешевый <span>{ this.state.cheapest }</span></button>
                                    <button type="button"
                                            data-sort="fastest"
                                            onClick={this.handleSortChange}>Самый быстрый <span>{ this.state.fastest }</span></button>
                                </div>
                                { this.state.errorText !== '' ?
                                    <div className="app__error">{this.state.errorText}</div>
                                    :
                                    this.state.tickets.map((ticket, index) =>
                                        <Ticket ticket={ticket}
                                                key={index} />
                                    )
                                }
                            </div>
                        </div>
                    </div>
                }
            </div>
        )
    }
}
