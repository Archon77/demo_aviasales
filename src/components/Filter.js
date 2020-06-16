import React from 'react';
import declOfNum from '../helpers/declOfNum';
import '../styles/components/filter.scss';

export default function (props) {
    const stops = props.stops.sort();
    const labelText = ['пересадка','пересадки','пересадок'];
    const createLabelText = val => {

        if (val > 0)
            return `${val} ${declOfNum(val, labelText)}`;
        else if (val === 0)
            return 'Без пересадок';
        else
            return 'Все';
    };

    return (
        <div className="filter">
            <div className="filter__title">Количество пересадок</div>

            { stops.map((stop, index) =>
                <label className="filter__checkbox"
                       key={index}>
                    <input type="checkbox"
                           name={stop}
                           checked={props.filteredBy.includes(stop)}
                           onChange={props.handleChange}/>
                    <span>{ createLabelText(stop) }</span>
                </label>
            )}
        </div>
    );
}