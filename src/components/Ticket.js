import React from 'react';
import declOfNum from '../helpers/declOfNum';
import '../styles/components/ticket.scss';

const decorateValues = val => val < 10 ? `0${val}` : val;

const formatTime = date => `${decorateValues(date.getHours())}:${decorateValues(date.getMinutes())}`;

const inOuTtime = (dateStartStr, duration) => {
    const dateStart = new Date(dateStartStr);
    const dateArrival = new Date(dateStart.getTime() + duration * 60 * 1000);

    return `${formatTime(dateStart)} - ${formatTime(dateArrival)}`
};

const formatDuration = duration => {
    const time = (duration / 60).toFixed(2).split('.');
    let hours = +time[0];
    let minutes = +time[1];

    if(minutes > 60) {
        minutes -= 60;
        hours += 1;
    }

    return `${hours}ч ${minutes}м`
};

const stopsText = ['пересадка','пересадки','пересадок'];
const createStopsText = val => declOfNum(val,stopsText);

export default function (props) {
    const ticket = props.ticket;

    return (
        <div className="ticket">
            <div className="ticket__top">
                <span className="ticket__price">{ ticket.price } Р</span>
                <img src={`https://pics.avs.io/99/36/${ticket.carrier}.png`} className="ticket__logo" alt="logo" />

            </div>
            { ticket.segments.map((option, index) =>
                <div className="ticket__options" key={index}>
                    <div className="ticket__info">
                        <span>{ option.origin } - { option.destination }</span>
                        <span>{ inOuTtime(option.date, option.duration) }</span>
                    </div>
                    <div className="ticket__info">
                        <span>В пути</span>
                        <span>{ formatDuration(option.duration) }</span>
                    </div>
                    { option.stops.length ?
                        <div className="ticket__info">
                            <span>{option.stops.length} { createStopsText(option.stops.length) }</span>
                            <span>
                                { option.stops.join(', ') }
                            </span>
                        </div>
                        :
                        ''
                    }

                </div>
            )}
        </div>
    );
}