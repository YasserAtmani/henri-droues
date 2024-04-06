import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme.service';
import { ChartOptions } from '../../../../../shared/models/chart-options';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'nft-chart-card',
  templateUrl: './nft-chart-card.component.html',
  standalone: true,
  imports: [AngularSvgIconModule, NgApexchartsModule, ReactiveFormsModule],
})
export class NftChartCardComponent implements OnInit, OnDestroy {
  public chartOptions: Partial<ChartOptions>;

  formGroup: FormGroup;

  data = [29000, 44000, 36000, 37000, 32500, 32500, 35500,]
  categories = [
    'Salaire 1',
    'Salaire 2',
    'Salaire 3',
    'Salaire 4',
    'Salaire 5',
    'Salaire 6',
    'Salaire 7',
  ];

  sub: Subscription = new Subscription();
  constructor(private themeService: ThemeService, private fb: FormBuilder) {
    let baseColor = '#FFFFFF';
    this.formGroup = this.fb.group({
      salaire: [0]
    })
    this.chartOptions = {
      series: [
        {
          name: 'Salaires',
          data: this.data,
        },
      ],
      chart: {
        fontFamily: 'inherit',
        type: 'area',
        height: 150,
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.2,
          stops: [15, 120, 100],
        },
      },
      stroke: {
        curve: 'smooth',
        show: true,
        width: 3,
        colors: [baseColor], // line color
      },
      xaxis: {
        categories: this.categories,
        labels: {
          show: false,
        },
        crosshairs: {
          position: 'front',
          stroke: {
            color: baseColor,
            width: 1,
            dashArray: 4,
          },
        },
        tooltip: {
          enabled: true,
        },
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: function (val) {
            return val + '$';
          },
        },
      },
      colors: [baseColor], //line colors
    };

    effect(() => {
      /** change chart theme */
      let primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
      primaryColor = this.HSLToHex(primaryColor);
      this.chartOptions.tooltip = {
        theme: this.themeService.theme().mode,
      };
      this.chartOptions.colors = [primaryColor];
      this.chartOptions.stroke!.colors = [primaryColor];
      this.chartOptions.xaxis!.crosshairs!.stroke!.color = primaryColor;
    });
  }

  private HSLToHex(color: string): string {
    const colorArray = color.split('%').join('').split(' ');
    const colorHSL = colorArray.map(Number);
    const hsl = {
      h: colorHSL[0],
      s: colorHSL[1],
      l: colorHSL[2],
    };

    const { h, s, l } = hsl;

    const hDecimal = l / 100;
    const a = (s * Math.min(hDecimal, 1 - hDecimal)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = hDecimal - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

      // Convert to Hex and prefix with "0" if required
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  ngOnInit(): void {
    this.sub.add(
      this.formGroup.valueChanges.subscribe(value => {

      })
    )
  }

  ngOnDestroy(): void {}

  get mean(): number {
    const sum = this.data.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.data.length) || 0;
  }

  get median(): number {

    if (this.data.length === 0) {
      throw new Error('Input array is empty');
    }

    // Sorting this.data, preventing original array
    // from being mutated.
    this.data = [...this.data].sort((a, b) => a - b);

    const half = Math.floor(this.data.length / 2);

    return (this.data.length % 2
        ? this.data[half]
        : (this.data[half - 1] + this.data[half]) / 2
    );
  }

  percentAbove(): number {
    let nb = 0;
    const salaire = this.formGroup.value.salaire;
    this.data.forEach(value => {
      if (value > salaire) nb++;
    })

    return Math.round((nb/this.data.length)*100);
  }
}
