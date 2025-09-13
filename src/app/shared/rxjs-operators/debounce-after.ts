import {
    SchedulerLike,
    asyncScheduler,
    MonoTypeOperatorFunction,
    Observable,
    tap,
    debounceTime,
} from 'rxjs';

export const debounceTimeAfter = <T>(
    amount: number,
    duration: number,
    scheduler: SchedulerLike = asyncScheduler
): MonoTypeOperatorFunction<T> => {
    return (source$: Observable<T>): Observable<T> => {
        return new Observable<T>((subscriber) => {
            let iterationCount = 0;

            const subscription = source$
                .pipe(
                    tap((value) => {
                        iterationCount++;
                        if (iterationCount <= amount) {
                            subscriber.next(value);
                        }
                    }),
                    debounceTime(duration, scheduler),
                    tap((value) => {
                        if (iterationCount > amount) {
                            subscriber.next(value);
                        }
                        iterationCount = 0;
                    })
                )
                .subscribe({
                    error: (err) => subscriber.error(err),
                    complete: () => subscriber.complete(),
                });

            return () => {
                subscription.unsubscribe();
            };
        });
    };
};
