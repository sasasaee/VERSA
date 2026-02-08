import React, { useEffect, useState } from 'react';
import './FlowingPetals.css';

const FlowingPetals = () => {
    const [petals, setPetals] = useState([]);

    useEffect(() => {
        const initialPetals = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100 + '%',
            animationDuration: Math.random() * 5 + 5 + 's', // 5-10s
            animationDelay: Math.random() * 5 + 's',
            width: Math.random() * 20 + 10 + 'px',
            height: Math.random() * 20 + 10 + 'px',
        }));
        setPetals(initialPetals);
    }, []);

    return (
        <div className="petals-container">
            {petals.map((petal) => (
                <div
                    key={petal.id}
                    className="petal"
                    style={{
                        left: petal.left,
                        animationDuration: petal.animationDuration,
                        animationDelay: petal.animationDelay,
                        width: petal.width,
                        height: petal.height,
                    }}
                />
            ))}
        </div>
    );
};

export default FlowingPetals;
