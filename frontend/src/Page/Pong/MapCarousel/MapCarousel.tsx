import './MapCarousel.scss'

const steps = [
    {
        label: 'basic',
        middle: 'none',
        ping: 'basic-ping-racket',
        pong: 'basic-pong-racket',
        ball: 'basic-ball',
    },
    {
        label: 'ia',
        firstMiddle: 'ia-racket',
        ping: 'ia-ping-racket',
        pong: 'ia-pong-racket',
        ball: 'ia-ball',
    },
    {
        label: 'ia',
        firstMiddle: 'ia-racket',
        secondMiddle: 'ia-racket',
        ping: 'ia-ping-racket',
        pong: 'ia-pong-racket',
        ball: 'ia-ball',
    }
]

function MapCarousel(props: any) {
    return (
        <div className="map-carousel">
            <div className="field">
                <div className="net"></div>
                <div className={steps[props.activeStep].ping}></div>
                <div className={steps[props.activeStep].firstMiddle}></div>
                <div className={steps[props.activeStep].secondMiddle}></div>
                <div className={steps[props.activeStep].pong}></div>
                {/* <div className='test-racket'></div> */}
                <div className={steps[props.activeStep].ball}></div>
            </div>
        </div>
    )
}

export default MapCarousel;