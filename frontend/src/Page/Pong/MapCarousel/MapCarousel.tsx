import './MapCarousel.scss'

const steps = [
    {
        label: 'Map original',
        ping: 'basic-ping-racket',
        pong: 'basic-pong-racket',
        ball: 'basic-ball',
    },
    {
        label: 'Map with obstacle 1',
        middle: 'ia-racket',
        ping: 'ia-ping-racket',
        pong: 'ia-pong-racket',
        ball: 'ia-ball',
    },
    {
        label: 'expand',
        middle: 'expand-middle',
        ping: 'expand-ping-racket',
        pong: 'expand-pong-racket',
        ball: 'expand-ball',
    },
    {
        label: 'create',
        field: 'blur-field',
        ping: 'create-ping-racket',
        pong: 'create-pong-racket',
        ball: 'create-ball',
    }
]

function MapCarousel(props: any) {
    return (
        <div className="map-carousel">
            {steps[props.activeStep].field ? <span>?</span> : ''}
            <div className={`field ${steps[props.activeStep].field}`}>
                <div className="net"></div>
                <div className={steps[props.activeStep].ping}></div>
                <div className={steps[props.activeStep].middle}></div>
                <div className={steps[props.activeStep].pong}></div>
                {/* <div className='test-racket'></div> */}
                <div className={steps[props.activeStep].ball}></div>
            </div>
        </div>
    )
}

export default MapCarousel;