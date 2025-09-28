export default function calcDistance(coord1: string, coord2: string): number {
    const pi = 3.14
    const fi_1 = Number((Number(coord1.split(' ')[0]) * pi / 180).toFixed(2))
    const fi_2 = Number((Number(coord2.split(' ')[0]) * pi / 180).toFixed(2))
    const lya_1 = Number((Number(coord1.split(' ')[1]) * pi / 180).toFixed(2))
    const lya_2 = Number((Number(coord2.split(' ')[1]) * pi / 180).toFixed(2))
    const r = 6371
    const distance = 2 * r * Math.asin(Math.sqrt(Math.pow(Math.sin((fi_2 - fi_1) / 2), 2) + Math.cos(fi_1) * Math.cos(fi_2) * Math.pow((Math.sin((lya_2 - lya_1) / 2)), 2)))
    return Number(distance.toFixed(2))
}