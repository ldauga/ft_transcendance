import './MapCarousel.scss'

const steps = [
    {
        label: 'Map original',
        middle: 'none',
        ping: 'basic-ping-racket',
        pong: 'basic-pong-racket',
        ball: 'basic-ball',
    },
    {
        label: 'Map with obstacle 1',
        middle: 'ia-racket',
        ping: 'basic-ping-racket',
        pong: 'basic-pong-racket',
        ball: 'ia-ball',
    },
    {
        label: 'Map with obstacle 2',
        middle: 'none',
        ping: 'basic-ping-racket',
        pong: 'basic-pong-racket',
        ball: 'basic-ball',
    },
    {
        label: 'Create your map !',
        middle: 'none',
        ping: 'basic-ping-racket',
        pong: 'basic-pong-racket',
        ball: 'basic-ball',
    },
]

function MapCarousel(props: any) {
    return (
        <div className="map-carousel">
            <span>{steps[props.activeStep].label}</span>
            <div className="field">
                <div className="net"></div>
                <div className={steps[props.activeStep].ping}></div>
                <div className={steps[props.activeStep].middle}></div>
                <div className={steps[props.activeStep].pong}></div>
                <div className={steps[props.activeStep].ball}></div>
            </div>
        </div>
    )
}

export default MapCarousel;